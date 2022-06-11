"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilesRoutes = void 0;
const express_1 = require("express");
const user_model_1 = require("../database/models/user.model");
const authentication_1 = require("../utilities/authentication");
const router = express_1.Router();
/**
 * GET /api/profiles/:username
 */
router.get('/:username', authentication_1.authentication.optional, (req, res, next) => {
    // If authentication was performed and was successful look up the profile relative to authenticated user
    if (req.payload) {
        user_model_1.User
            .findById(req.payload.id)
            .then((user) => {
            res.status(200).json({ profile: req.profile.toProfileJSONFor(user) });
        })
            .catch(next);
        // If authentication was NOT performed or successful look up profile relative to that same user (following = false)
    }
    else {
        res.status(200).json({ profile: req.profile.toProfileJSONFor(req.profile) });
    }
});
/**
 * POST /api/profiles/:username/follow
 */
router.post('/:username/follow', authentication_1.authentication.required, (req, res, next) => {
    const profileId = req.profile._id;
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        return user.follow(profileId).then(() => {
            return res.json({ profile: req.profile.toProfileJSONFor(user) });
        });
    })
        .catch(next);
});
/**
 * DELETE /api/profiles/:username/follow
 */
router.delete('/:username/follow', authentication_1.authentication.required, (req, res, next) => {
    const profileId = req.profile._id;
    user_model_1.User
        .findById(req.payload.id)
        .then((user) => {
        return user.unfollow(profileId).then(() => {
            return res.json({ profile: req.profile.toProfileJSONFor(user) });
        });
    })
        .catch(next);
});
exports.ProfilesRoutes = router;
//# sourceMappingURL=profiles-routes.js.map