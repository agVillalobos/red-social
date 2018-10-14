'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req, res) {
    var params = req.body;

    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el seguimiento.' });

        if (!followStored) return res.status(404).send({ message: 'El seguimiento no se ha guardado.' });

        return res.status(200).send({ follow: followStored });
    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove((err) => {
        if (err) return res.status(500).send({ message: 'Error al guardar el seguimiento.' });

        return res.status(200).send({ message: 'El follow se ha eliminado' });
    });
}

function getFollowingUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;
    Follow.find({ user: userId }).populate({ path: 'followed' })
        .paginate(page, itemsPerPage, (err, follows, total) => {
            if (err) return res.status(500).send({ message: 'Error en el servidor.' });

            if (!follows) {
                return res.status(400).send({ message: 'No se encontraron follows.' });
            }

            // return res.status(200).send({
            //     total: total,
            //     pages: Math.ceil(total / itemsPerPage),
            //     follows
            // });

            //usar followUserIds en vez.
            Follow.find({ "user": req.user.sub }).select({ '_id': 0, '_v': 0, 'user': 0 }).exec((err, following) => {

                Follow.find({ "followed": req.user.sub }).select({ '_id': 0, '_v': 0, 'followed': 0 })
                    .exec((err, followed) => {

                        var following_clean = [];
                        if (following) {
                            following.forEach((follow) => {
                                following_clean.push(follow.followed);
                            });
                        }

                        var followed_clean = [];
                        if (followed) {
                            followed.forEach(follow => {
                                followed_clean.push(follow.user);
                            });
                        }
                        return res.status(200).send({
                            total: total,
                            pages: Math.ceil(total / itemsPerPage),
                            follows,
                            users_following: following_clean,
                            users_follow_me: followed_clean,
                        });
                    });

            });

            // followUserIds(req.user.sub).then((value) => {
            //     return res.status(200).send({
            //         total: total,
            //         pages: Math.ceil(total / itemsPerPage),
            //         follows,
            //         users_following: value.following,
            //         users_follow_me: value.followed,
            //     });
            // });
        });
}


async function followUserIds(user_id) {
    var following = await Follow.find({ "user": user_id })
        .select({ '_id': 0, '_v': 0, 'user': 0 })
        .exec((err, follows) => {

            return follows;
        });

    var followed = await Follow.find({ "followed": user_id })
        .select({ '_id': 0, '_v': 0, 'followed': 0 })
        .exec((err, follows) => {
            // console.log(follows);
            return follows;
        });

    var following_clean = [];
    if (following) {
        following.forEach((follow) => {
            following_clean.push(follow.followed);
        });
    }

    var followed_clean = [];
    if (followed) {
        followed.forEach(follow => {
            followed_clean.push(follow.user);
        });
    }

    return {
        following: following_clean,
        followed: followed_clean
    }
}

function getFollowedUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;
    Follow.find({ followed: userId }).populate('user followed')
        .paginate(page, itemsPerPage, (err, followed, total) => {
            if (err) return res.status(500).send({ message: 'Error en el servidor.' });

            if (!followed) {
                return res.status(400).send({ message: 'No te sigue ningun usuario.' });
            }

            // return res.status(200).send({
            //     total: total,
            //     pages: Math.ceil(total / itemsPerPage),
            //     followed
            // });


            //usar followUserIds en vez.
            Follow.find({ "user": req.user.sub }).select({ '_id': 0, '_v': 0, 'user': 0 }).exec((err, following) => {

                Follow.find({ "followed": req.user.sub }).select({ '_id': 0, '_v': 0, 'followed': 0 })
                    .exec((err, follows) => {

                        var following_clean = [];
                        if (following) {
                            following.forEach((follow) => {
                                following_clean.push(follow.followed);
                            });
                        }

                        var followed_clean = [];
                        if (follows) {
                            follows.forEach(follow => {
                                followed_clean.push(follow.user);
                            });
                        }
                        return res.status(200).send({
                            total: total,
                            pages: Math.ceil(total / itemsPerPage),
                            followed,
                            users_following: following_clean,
                            users_follow_me: followed_clean,
                        });
                    });
            });
        });
}



//Devolver listado de usaiors.
function getMyFollows(req, res) {
    var userId = req.user.sub;

    var find = Follow.find({ user: userId });
    if (req.params.followed) {
        find = Follow.find({ followed: userId });
    }

    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error en el servidor.' });

        if (!follows) {
            return res.status(400).send({ message: 'No te sigue ningun usuario.' });
        }

        return res.status(200).send({ follows });
    });
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}