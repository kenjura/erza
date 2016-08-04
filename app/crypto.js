const crypto = require('crypto');
const salt = 'V/Z0hp1CGwaIlr0HW9V/yA==';
const secret = 'test';

var saltbuf = new Buffer(salt, 'base64');
console.log('SALT='+saltbuf);

// console.log(crypto.getHashes());

	// crypto.randomBytes(17, function(err, buf) {
 //        if (err) throw err;
 //        console.log( buf.toString('base64') );
 //    });

crypto.pbkdf2(secret, salt, 100000, 64, 'sha512', (err, key) => {
  if (err) throw err;
  console.log('key='+key.toString('base64'));
  console.log('salt='+saltbuf.toString('base64'));
});



var obj = pbkdf2(secret,salt,100000,64);
console.log('ALTERNATE FUNCTION\nkey='+obj.toString('base64'));


function pbkdf2(key, salt, iterations, dkLen) {
  var hLen = 64 //SHA512 Mac length
  // assert(dkLen <= (Math.pow(2, 32) - 1) * hLen, 'requested key length too long')
  // assert(typeof key == 'string' || Buffer.isBuffer(key), 'key must be a string or buffer')
  // assert(typeof salt == 'string' || Buffer.isBuffer(salt), 'key must be a string or buffer')

  if (typeof salt == 'string') salt = new Buffer(salt)

  var DK = new Buffer(dkLen)
  var T = new Buffer(hLen)
  var block1 = new Buffer(salt.length + 4)

  var l = Math.ceil(dkLen / hLen)
  var r = dkLen - (l - 1) * hLen

  salt.copy(block1, 0, 0, salt.length)
  for (var i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, salt.length)

    var U = crypto.createHmac('sha512', key).update(block1).digest()
    U.copy(T, 0, 0, hLen)

    for (var j = 1; j < iterations; j++) {
      U = crypto.createHmac('sha512', key).update(U).digest()

      for (var k = 0; k < hLen; k++) {
        T[k] ^= U[k]
      }
    }

    var destPos = (i - 1) * hLen
    var len = (i == l ? r : hLen)
    T.copy(DK, destPos, 0, len)
  }

  return DK
}
