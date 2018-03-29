process.env.NODE_ENV = 'test';

// bring in node modules
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// bring in our Koa web server and database connection
const server = require('../../src/server/index');
const knex = require('../../src/server/db/connection');

// test our user CRUD routes
describe('routes : users', () => {
    // we need a fresh instance of the database before each test is run
    beforeEach(() => {
        return knex.migrate.rollback()
        .then(() => { return knex.migrate.latest(); })
        .then(() => { return knex.seed.run(); })
    });

    afterEach(() => {
        return knex.migrate.rollback();
    });

    describe('GET /api/v1/users', () => {
        it('should return all users', (done) => {
            chai.request(server)
            .get('/api/v1/users')
            .end((err, res) => {
                // we should have no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"status": "good!"}
                res.body.status.should.eql('good!');
                // the JSON response body should have a  
                // key-value pair of {"data": [2 objects]}
                res.body.data.length.should.eql(2);
                // the first object in the data array should 
                // have the right keys
                res.body.data[0].should.include.keys(
                    'id', 'email', 'password', 'first_name', 'last_name', 
                    'date_of_birth', 'home_phone_number', 'cell_phone_number',
                    'current_address', 'previous_address', 'created_at', 'updated_at' 
                );
                done();
            });
        });
    });

    describe('GET /api/v1/users/:id', () => {
        it('should return a single user', (done) => {
            chai.request(server)
            .get('/api/v1/users/1')
            .end((err, res) => {
                // we should have no errors
                should.not.exist(err);
                // there should be a 200 status code
                res.status.should.equal(200);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"status": "good!"}
                res.body.status.should.eql('good!');
                // the JSON response body should have a  
                // key-value pair of {"data": [1 objects]}
                res.body.data.length.should.eql(1);
                // the first object in the data array should 
                // have the right keys
                res.body.data[0].should.include.keys(
                    'id', 'email', 'password', 'first_name', 'last_name', 
                    'date_of_birth', 'home_phone_number', 'cell_phone_number',
                    'current_address', 'previous_address', 'created_at', 'updated_at' 
                );
                done();
            });
        });

        it('should throw an error if the user does not exist', (done) => {
            chai.request(server)
            .get('/api/v1/users/999999999')
            .end((err, res) => {
                // there should be an error
                should.exist(err);
                // there should be a 404 status code
                res.status.should.equal(404);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"message": "no good :("}
                res.body.status.should.eql('no good :(');
                // the JSON response body should have a 
                // key-value pair of {"message": "That user does not exist."}
                res.body.message.should.eql('That user does not exist.');
                done();
            });
        });        
    });

    describe('POST /api/v1/users', () => {
        it('should return the user that was added', (done) => {
            chai.request(server)
            .post('/api/v1/users')
            .send({
                email: 'dignityapps@gmail.com',
                password: 'test9876',
                first_name: 'Dignity',
                last_name: 'Applications',
                date_of_birth: '10/01/1990',
                home_phone_number: '704-885-8342',
                cell_phone_number: '704-111-3357',
                current_address: '1234 Test St., Wilmington NC 28412',
                previous_address: '4321 Test Rd., Testville NC 28110'            
            })
            .end((err, res) => {
                // there should be no errors
                should.not.exist(err);
                // there should be a 201 status code
                // indicating that something was created
                res.status.should.equal(201);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"status": "good!"}
                res.body.status.should.eql('good!');
                // the JSON response body should have a 
                // key-value pair of {"data": 1 user object}
                res.body.data.length.should.eql(1);
                // the first object in the data array should
                // have the right keys
                res.body.data[0].should.include.keys(
                    'id', 'email', 'password', 'first_name', 'last_name', 
                    'date_of_birth', 'home_phone_number', 'cell_phone_number',
                    'current_address', 'previous_address', 'created_at', 'updated_at' 
                );
                done();
            });
        });

        it('should throw an error if the payload is malformed', (done) => {
            chai.request(server)
            .post('/api/v1/users')
            .send({
                test: 'not sending the right payload!'
            })
            .end((err, res) => {
                // there should be an error
                should.exist(err);
                // there should be a 400 status code
                res.status.should.equal(400);
                // the response should be JSON
                res.type.should.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"status": "no good :("}
                res.body.status.should.eql('no good :(');
                // the JSON response body should have a message key
                should.exist(res.body.message);
                done();
            });
        });
    });

    describe('PUT /api/v1/users/:id', () => {
        it('should return the user that was updated', (done) => {
            knex('users')
            .select('*')
            .then((users) => {
                const userObject = users[0];
                chai.request(server)
                .put(`/api/v1/users/${userObject.id}`)
                .send({
                    first_name: 'Jerry'
                })
                .end((err, res) => {
                    // there should be no errors
                    should.not.exist(err);
                    // there should be a 200 status code
                    res.status.should.equal(200);
                    // the response should be JSON
                    res.type.should.equal('application/json');
                    // the JSON response body should have a 
                    // key-value pair of {"status", "good!"}
                    res.body.status.should.eql('good!');
                    // the JSON response body should have a 
                    // key-value pair of {"data": 1 user object}
                    res.body.data.length.should.eql(1);
                    // the first object in the data array should 
                    // have the right keys
                    res.body.data[0].should.include.keys(
                        'id', 'email', 'password', 'first_name', 'last_name', 
                        'date_of_birth', 'home_phone_number', 'cell_phone_number',
                        'current_address', 'previous_address', 'created_at', 'updated_at' 
                    );
                    // ensure the user was in fact updated
                    const newUserObject = res.body[0];
                    newUserObject.first_name.should.not.eql(userObject.first_name);
                    done();
                });
            });
        });

        it('should throw an error if the user does not exist', (done) => {
            chai.request(server)
            .put('/api/v1/users/9999999')
            .send({
                first_name: 'Jerry'
            })
            end((err, res) => {
                // there should be an error
                should.exist(err);
                // there should be a 404 status 
                res.status.should.equal(404);
                // the resopnse should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"status": "no good :("}
                res.body.status.should.eql('no good :(');
                // the JSON response body should have a 
                // key-value pair of {"message": "That user does not exist."}
                res.body.message.should.eql('That user does not exist.');
                done();
            });
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('should return the user that was deleted', (done) => {
            knex('users')
            .select('*')
            .then((users) => {
                const userObject = users[0];
                const lengthBeforeDelete = users.length;
                chai.request(server)
                .delete(`/api/v1/users/${userObject.id}`)
                .end((err, res) => {
                    // there should be no errors
                    should.not.exist(err);
                    // there should be a 200 status code
                    res.status.should.equal('application/json');
                    // the JSON response body should have a 
                    // key-value pair of {"status": "good!"}
                    res.body.status.should.eql('good!');
                    // the JSON response body should have a 
                    // key-value pair of {"data": 1 user object}
                    res.body.data.length.should.eql(1);
                    // the first object in the data array should
                    // have the right keys
                    res.body.data[0].should.include.keys(
                        'id', 'email', 'password', 'first_name', 'last_name', 
                        'date_of_birth', 'home_phone_number', 'cell_phone_number',
                        'current_address', 'previous_address', 'created_at', 'updated_at' 
                    );
                    // ensure that the job request was in fact deleted
                    knex('users').select('*')
                    .then((updatedUsers) => {
                        updatedUsers.length.should.eql(lengthBeforeDelete - 1);
                        done();
                    });
                });
            });
        });

        it('should throw an error if the user does not exist', (done) => {
            chai.request(server)
            .delete('/api/v1/users/9999999')
            .end((err, res) => {
                // there should be an error
                should.exist(err);
                // there should be a 404 status code
                res.status.should.equal(404);
                // the response should be JSON
                res.type.should.equal('application/json');
                // the JSON response body should have a 
                // key-value pair of {"status": "no good :("}
                res.body.status.should.eql('no good :(');
                // the JSON response body should have a 
                // key-value pair of {"message": "That user does not exist."}
                res.body.message.should.eql('That user does not exist.');
                done();
            });
        });
    });
});

