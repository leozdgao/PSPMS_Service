var crypto = require('crypto');
var Promise = require('bluebird');

var len = 128;
var iterations = 12000;

exports.salthash = function (pwd, salt) {

    return new Promise(function(resolve, reject) {

        if (pwd && salt) {
            crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash) {
                if(err) reject(err);
                else resolve(hash.toString("base64"));
            });
        } else {
            
            crypto.randomBytes(len, function(err, salt){

                // if (err) return fn(err);
                if(err) reject(err);
                else {
                    salt = salt.toString('base64');
                    crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
                        if (err) reject(err);
                        else {
                            resolve([salt, hash.toString("base64")]);
                            // fn(null, salt, hash);
                        } 
                    });    
                }
            });
        }    
    });
};

exports.md5 = function(content) {

    var md5 = crypto.createHash("md5");
    md5.update(content);
    
    return md5.digest("hex");
}