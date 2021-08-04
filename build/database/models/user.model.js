"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
const secrets_1 = require("../../utilities/secrets");
const mongooseUniqueValidator = require("mongoose-unique-validator");
// ISSUE: Own every parameter and any missing dependencies
const UserSchema = new mongoose_1.Schema({
    username: {
        type: mongoose_1.Schema.Types.String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },
    bio: {
        type: mongoose_1.Schema.Types.String
    },
    image: {
        type: mongoose_1.Schema.Types.String
    },
    mobileNumber: {
        type: mongoose_1.Schema.Types.String
    },
    fullName: {
        type: mongoose_1.Schema.Types.String
    },
    dob: {
        type: mongoose_1.Schema.Types.String
    },
    favorites: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Article'
        }
    ],
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    hash: {
        type: mongoose_1.Schema.Types.String
    },
    salt: {
        type: mongoose_1.Schema.Types.String
    },
    wallet: {
        type: mongoose_1.Schema.Types.Mixed
    }
}, { timestamps: true });
UserSchema.plugin(mongooseUniqueValidator, { message: 'is already taken.' });
UserSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};
UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};
UserSchema.methods.generateJWT = function () {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: exp.getTime() / 1000,
    }, secrets_1.JWT_SECRET);
};
UserSchema.methods.toAuthJSON = function () {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image,
        dob: this.dob,
        mobileNumber: this.mobileNumber,
        fullName: this.fullName,
        wallet: this.wallet
    };
};
UserSchema.methods.toProfileJSONFor = function (user) {
    return {
        username: this.username,
        bio: this.bio,
        image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
        following: user ? user.isFollowing(this._id) : false,
        dob: this.dob,
        mobileNumber: this.mobileNumber,
        fullName: this.fullName
    };
};
UserSchema.methods.favorite = function (id) {
    if (this.favorites.indexOf(id) === -1) {
        this.favorites.push(id);
    }
    return this.save();
};
UserSchema.methods.unfavorite = function (id) {
    this.favorites.remove(id);
    return this.save();
};
UserSchema.methods.isFavorite = function (id) {
    return this.favorites.some(function (favoriteId) {
        return favoriteId.toString() === id.toString();
    });
};
UserSchema.methods.follow = function (id) {
    if (this.following.indexOf(id) === -1) {
        this.following.push(id);
    }
    return this.save();
};
UserSchema.methods.unfollow = function (id) {
    this.following.remove(id);
    return this.save();
};
UserSchema.methods.isFollowing = function (id) {
    return this.following.some(function (followId) {
        return followId.toString() === id.toString();
    });
};
exports.User = mongoose_1.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map