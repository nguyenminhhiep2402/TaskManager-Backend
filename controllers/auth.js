// const Joi = require('joi')
// const Joi = require('@hapi/joi');
// module.exports = {
//         CreateUser(req, res) {
//             const schema = Joi.Object().keys({
//                 username: Joi.string()
//                     .min(5)
//                     .max(15)
//                     .required(),
//                 email: Joi.string()
//                     .min(6)
//                     .email()
//                     .require(),
//                 password: Joi.string()
//                     .min(5)
//                     .required()
//             });
//             const { error, value } = Joi.validate(req.body, schema);
//             if (error & error.details) {
//                 return res.status(500).json({ message: error.details });
//             }
//         }
//     }
/////////////////////////
// const validation = schema.validate(req.body);
// res.body(s);
// console.log(req.body);
///////////////////////
// Joi.validate(req.body, schema, function(err, value) {
//     if (err) {
//         return catched(err.details);
//     }
// });
// CreateUser() {
//     const JoiSchema = Joi.object({

//         username: Joi.string()
//             .min(5)
//             .max(30)
//             .required(),

//         email: Joi.string()
//             .email()
//             .min(5)
//             .max(50)
//             .optional(),
//         password: Joi.string()
//             .min(5)
//             .required()

//     }).options({ abortEarly: false });

//     return JoiSchema.CreateUser()
// }}
////////////////////////////////////////
const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');
const User = require('../models/userModels');
const helpers = require('../helpers/helper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/secret');

module.exports = {
    async CreateUser(req, res) {
        const schema = Joi.object().keys({

            username: Joi.string().min(5).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).required()
        });

        Joi.validate(req.body, schema, (err) => {

            if (err) {
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({ msg: err.details });
                // console.log(err.details);

            }


        });
        const userEmail = await User.findOne({ email: helpers.lowerCase(req.body.email) });
        if (userEmail) {
            return res
                .status(HttpStatus.CONFLICT)
                .json({ message: 'Email already exist' });
        }
        const userName = await User.findOne({ username: helpers.firstUpper(req.body.username) });
        if (userName) {
            return res
                .status(HttpStatus.CONFLICT)
                .json({ message: 'Username already exsit' });
        }
        return bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res
                    .status(HttpStatus.BAD_REQUEST)
                    .json({ message: 'Error hashing password' });
            }
            const body = {
                username: helpers.firstUpper(req.body.username),
                email: helpers.lowerCase(req.body.email),
                password: hash
            };
            User.create(body)
                .then(user => {
                    const token = jwt
                        .sign({ data: user }, dbConfig.secret, { expiresIn: '1h' });
                    // console.log(token)
                    res.cookie('auth', token);
                    res
                        .status(HttpStatus.CREATED)
                        .json({ message: 'User create successfully', user, token });
                })
                .catch(err => {
                    res
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({ message: 'Error occured' });
                })
        });
    },
    async LoginUser(req, res) {
        if (!req.body.username || !req.body.password) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'No empty fields allowed' })
        }
        await User.findOne({ username: helpers.firstUpper(req.body.username) })
            .then(user => {
                if (!user) {
                    return res.status(HttpStatus.NOT_FOUND).json({ message: 'User name not found' })

                }
                return bcrypt.compare(req.body.password, user.password).then((result) => {

                    if (!result) {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Password is incorrect' })
                    }
                    const token = jwt
                        .sign({ data: user }, dbConfig.secret, {
                            expiresIn: '1h'
                        });
                    res.cookie('auth', token);
                    return res
                        .status(HttpStatus.OK)
                        .json({ message: 'Login successfully', user, token });
                })
            })
            .catch(err => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' })

            })
    }
}