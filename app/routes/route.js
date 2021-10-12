var User = require('../models/user');
const Web3 = require('web3');

module.exports = function(router){
    router.post('/register', function(req,res)
    {
        var user = new User();
        //console.log(req.body);
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.role = 3;
        //user.role = 1;
        if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == ''||req.body.email == null || req.body.email == '' )

        {
            res.send('Invalid Username or Password');
        }
        else{
            user.save(function(err)
            {
                if(err)
                {
                    console.log(err);
                    res.send("Username or email is exist");
                }
                else
                {
                    res.send(
                        {
                            code:200,
                        }
                    )
                }
            })
        }
    })
    router.post('/login',function(req,res)
    {
        //console.log(req.session);
        sess = req.session;
        sess.username = req.body.username;
        User.findOne({ username : req.body.username }).select('email username password role').exec(function(err,user)
        {
            if (err) throw err;
            if(!user)
            {
                res.send(
                    {
                        code: 700,
                        status: "Wrong username"
                        });
            }
            else if(user)
            {
                //console.log(user);
                var validPassword = user.comparePassword(req.body.password);
                if(!validPassword)
                {
                    res.send(   {
                        code: 700,
                        status: "Wrong password"
                        });
                }
                else 
                {
                        req.session.user_id = user._id;
                        // req.session.username = user.username;
                        console.log(req.session);
                        req.session.save(() => {
                            console.log(req.session);
                            return res.send(
                                {
                                    code:200,
                                    user_id:user._id,
                                    role: user.role
                                }
                            );
                          });
                    
                }
            }
        })
    })
    router.get('/checkLogin',function(req,res)
    {
        console.log(req.session);
        if(!req.session.username){
            res.send('You are not logged in');
          }else{
            res.send(
                { status: 'You are logged in',
                user: req.session.username});
          }
    })
    router.get('/logout', function(req, res, next) {
        console.log(req.session);
        if (req.session) {
          // delete session object
          req.session.destroy(function(err) {
            if(err) {
              return next(err);
            } else {
              return res.send("Đăng xuất thành công");
            }
          });
        }
      });
      return router;
}