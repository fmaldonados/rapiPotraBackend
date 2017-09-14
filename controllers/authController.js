var joi = require('joi');
var boom = require('boom');
var user = require('../schemas/usuario');
var bcrypt = require('bcrypt');

exports.login = {
    auth: false,
    validate: {
      payload: {
        nombreUsuario: joi.string().required(),
        password: joi.string().min(2).max(200).required()
      }
    },
    handler: function(request, reply) {
      console.log(request.payload.password);
      user.find({nombreUsuario: request.payload.nombreUsuario}, function(err, user){
        console.log('nombreUsuario: ', request.payload.nombreUsuario, 'user', user)
        if(err)
          return reply(boom.notAcceptable('Error Executing Query'));
        if(user.length > 0){
          bcrypt.compare(request.payload.password, user[0].password, function(err, res){
            console.log('res',res);
            if(err)
                return reply(boom.unauthorized('Wrong email'));
            if(res){
              console.log('before setting cookie');
              request.cookieAuth.set(user[0]);
              console.log('after setting cookie')
              return reply({nombreUsuario: user[0].nombreUsuario, scope: user[0].scope});
            }else{
              return reply(boom.unauthorized('Wrong password'))
            }
          });
        }
      });
    }
};
exports.logout = {
    auth: {
      mode:'required',
      strategy:'session'
    },
    handler: function(request, reply) {
      //console.log(request.headers);
      request.cookieAuth.clear();
      return reply('Logout Successful!');
    }
  };