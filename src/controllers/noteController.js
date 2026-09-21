const mongoose=require("mongoose");
const Note=require("../models/Note");
const User=require("../models/User");
const asyncHandler=require("../utils/asyncHandler");

exports.create=asyncHandler(
    async(req,res)=>res.status(201).json(
        await Note.create(req.body)
    )
);

exports.list=asyncHandler(
    async(req,res)=>res.json(
        await Note.find().populate("client prestataire commande")
    )
);

exports.byClient=asyncHandler(
    async(req,res)=>res.json(
        await Note.find({
            client:req.params.id
        }).populate("client prestataire commande")
    )
);

exports.byCommande=asyncHandler(
    async(req,res)=>res.json(
        await Note.find({
            commande:req.params.id
        }).populate("client prestataire commande")
    )
);

exports.moyenneParPrestataire=asyncHandler(
    async(req,res)=>{
        const r=await Note.aggregate(
            [{
                $match:{prestataire:new mongoose.Types.ObjectId(req.params.id)}},
                {$group:{_id:null,moyenne_score:{$avg:"$score"}}}
            ]);
            res.json({
                moyenne:r[0]?.moyenne_score||0,moyenne_score:r[0]?.moyenne_score||0
            });
        }
    );

exports.topPrestataires=asyncHandler(
    async(req,res)=>{
        const rows=await Note.aggregate([
            {
                $group:{
                    _id:"$prestataire",
                    moyenne_notes:{$avg:"$score"},
                    nombre_notes:{$sum:1}}
                },
                {
                    $match:{
                        nombre_notes:{$gte:3}
                    }
                },
                {
                    $sort:{moyenne_notes:-1}
                },
                {$limit:3}
            ]
        );
        const users=await User.find({
            _id:{$in:rows.map(r=>r._id)}
        }).populate("categorie");
        res.json(
            rows.map(row=>({
                ...row,prestataire:users.find(u=>String(u.id)===String(row._id))})
            )
        );
    }
);

exports.scores=asyncHandler(
    async(req,res)=>{
        const rows=await Note.aggregate([
            {
                $group:{
                    _id:"$prestataire",
                    moyenne_score:{$avg:"$score"}
                }
            },
            {
                $sort:{moyenne_score:-1}
            }
        ]);
        const users=await User.find({
            _id:{$in:rows.map(r=>r._id)}
        });
        res.json(
            rows.map(row=>{
                const u=users.find(x=>String(x.id)===String(row._id)
            );
            return{
                prestataire__id:row._id,
                prestataire__nom:u?.nom,
                prestataire__prenom:u?.prenom,
                moyenne_score:row.moyenne_score
            };
        })
    );
});

exports.commentaires=asyncHandler(
    async(req,res)=>res.json(
        await Note.find({
            prestataire:req.params.prestataire_id,
            commentaire:{$nin:[null,""]}}).sort("-createdAt").populate("client commande")
        ));