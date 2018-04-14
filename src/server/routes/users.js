// get our router and queries
const Router = require('koa-router');
const queries = require('../db/queries/users');

// bring in our helper functions
const permissions = require('./_permissionHelpers');

const router = new Router();
const BASE_URL = `/api/v1/users`;

// return all users
router.get(BASE_URL, async (ctx) => {
    try {
        let user = ctx.state.user || null;

        // make sure the current user (or lack of user) can 'See' all types of users
        // note: the lack of a third argument indicates that we want to see all
        let canDo = await permissions.canDo(user, 'SeeAnyUser');
        if (canDo) {
            const users = await queries.getAllUsers();
            ctx.body = {
                status: 'good!',
                data: users
            };
        } else {
            ctx.status = 401;
            ctx.body = {
                status: 'no good :(',
                message: 'User does not have the necessary permissions to perform this action.'
            };
        }
    } catch (err) {
        console.log(err);
    }
});

// return a single user
router.get(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const user = await queries.getSingleUser(ctx.params.id);
        if (user.length) {
            ctx.body = {
                status: 'good!',
                data: user
            };
        } else {
            ctx.status = 404;
            ctx.body = {
                status: 'no good :(',
                message: 'That user does not exist.'
            };
        }
    } catch (err) {
        console.log(err);
    }
});

// create a new user
router.post(`${BASE_URL}`, async(ctx) => {
    try {
        const user = await queries.addUser(ctx.request.body);
        if (user.length) {
            ctx.status = 201;
            ctx.body = {
                status: 'good!',
                data: user
            };
        } else {
            ctx.status = 400;
            ctx.body = {
                status: 'no good :(',
                message: 'Something went wrong.'
            };
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = {
            status: 'no good :(',
            message: err.message || 'Sorry, an error has occurred'
        };
    }
});

// update a user
router.put(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const user = await queries.updateUser(ctx.params.id, ctx.request.body);
        if (user.length) {
            ctx.status = 200;
            ctx.body = {
                status: 'good!',
                data: user
            };
        } else {
            ctx.status = 404;
            ctx.body = {
                status: 'no good :(',
                message: 'That user does not exist.'
            };
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = {
            status: 'no good :(',
            message: err.message || 'Sorry, an error has occurred'
        }
    }
});

// delete a user
router.delete(`${BASE_URL}/:id`, async (ctx) => {
    try {
        const user = await queries.deleteUser(ctx.params.id);
        if (user.length) {
            ctx.status = 200;
            ctx.body = {
                status: 'good!',
                data: user
            };
        } else {
            ctx.status = 404;
            ctx.body = {
                status: 'no good :(',
                message: 'That user does not exist.'
            };
        }
    } catch (err) {
        ctx.status = 400;
        ctx.body = {
            status: 'no good :(',
            message: err.message || 'Sorry, an error has occurred.'
        };
    }
})

module.exports = router;