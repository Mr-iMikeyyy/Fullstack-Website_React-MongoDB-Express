const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Favorites = require('../models/favorites');
const dishRouter = require('./dishRouter');

const favoriteRouter = express.Router();

favoriteRouter.use(express.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}).populate('user', 'dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite = null) {
            Favorites.create({user: req.user._id, dishes: req.body})
            .then((favorites) => {
                console.log('Favorites Added: ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
        }
        else if (favorite != null) {
            if (favorite.dishes != req.body) {
                favorite.dishes.push(req.body);
                favorite.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id).populate('user', 'dishes')
                    .then((favorites) => {
                        console.log('Favorites Added: ', favorites);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                }, (err) => next(err));
            }
            else {
                err = new Error('Favorite list already created');
                err.statusCode = 403;
                return next(err);
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishid')
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorite) => {
        if (favorite.dishes.includes(req.params.dishid)) {
            var err = new Error('Dish already in favorites');
            err.statusCode = 403;
            return next(err);
        }
        else {
            favorite.dishes.push(req.params.dishid)
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user', 'dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })   
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user: req.user._id})
    .then((favorite) => {
        if (favorite.dishes.includes(req.params.dishid)) {
            var filtered = favorite.dishes.filter(req.params.dishid);
            favorite.dishes = filtered;
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id).populate('user', 'dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })   
            }, (err) => next(err));
        }
        else {
            var err = new Error('Dish is already favorited');
            err.statusCode = 403;
            return next(err);
        }
    })
    .catch((err) => next(err))
});

module.exports = favoriteRouter;