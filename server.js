const express = require('express');
const app = express();
var User = require('./app/models/user');
const bodyparser = require('body-parser'); 
var mongoose = require('mongoose');
const session = require('express-session');
var cors = require('cors');
const path = require('path');
var sess;
app.use(cors());
app.use(bodyparser.json());
app.use(express.json());
app.use(bodyparser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(session({
    secret: 'hieuhihi',
    resave: true,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 600000
     }
  }));
app.use(express.static(__dirname + '/public'));
app.get('/',(req,res)=>res.sendFile(path.resolve(__dirname, './public/login.html')));




// blockchain Ethereum setup
const Web3 = require('web3');
const prc = require('./build/contracts/PRC.json');
const bac = require('./build/contracts/BAC.json');
const tuc = require('./build/contracts/TUC.json');
const contract = require('truffle-contract');
var prcAddress = '0x4ae9cbd253e6c3621702a1df9ddb0161217e106d';
const address = '0x6C2cA4BD44B0b5FA149Aaa122b35904bc97609B4';
const receive = '0x2112BA4A4caD26BbdDe2933fB1960f74A3875661';
// var newTUC;
// var newBAC;
// var bacAddress;
// var tucAddress;
// var PRC;
// var BAC;
// var TUC;
var defaultGas = 4700000;
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const Bac = contract(bac);
Bac.setProvider(web3.currentProvider);  


 
const Prc = contract(prc);
Prc.setProvider(web3.currentProvider);    
       
const Tuc = contract(tuc);      
Tuc.setProvider(web3.currentProvider) ;






app.listen(8880,function()
{
    console.log('Server is running on port 8880');
})
mongoose.connect('mongodb://localhost:27017/SupplyChain', async function(err)
{
    if(err)
    {
        console.log("Not connect to Database"+ err);
    }
    else{
    console.log('Connect to Database Success');
    }
})
app.post('/register', function(req,res)
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
app.post('/login',function(req,res)
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
                    //console.log(req.session);
                    req.session.save(() => {
                       // console.log(req.session);
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
app.get('/checkLogin',function(req,res)
{
    //console.log(req.session);
    if(!sess.username){
        res.send('You are not logged in');
      }else{
        res.send(
            { status: 'You are logged in',
            user: sess.username});
      }
})
app.get('/logout', function(req, res, next) {
    sess.username = null;
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
  app.post('/registerMaterial',function (req,res)
  {
      var prcInstance;
      var newBAC;
      //console.log(req.body);
      var materialName = req.body.materialName;
      var materialCode = req.body.materialCode;
      var materialFarm = req.body.materialFarm;
      Bac.new({
        from: address,
        gas: defaultGas
    }).then(function(instance)
    {
        console.log("BAC CREATED");
       newBAC = instance.address; 
       console.log(newBAC);
    }).then(function()
    {
        Prc.at(prcAddress).then(function(instance) {
            //console.log(instance);
            prcInstance = instance;
            //console.log("Get PRC address Success")
            return  prcInstance.materialRegister(materialName, materialCode, materialFarm, newBAC, {
                from: address,
                gas: defaultGas
              });
      }).then(function(txReceipt) {
          console.log(txReceipt);
          res.send(txReceipt.transactionHash);
          // var BACaddress = { BACaddress : newBAC}
          // var datasend = JSON.stringify(BACaddress);
          // res.send(datasend);
  });
  });
  })
  function getTotalMaterial()
{
    var prcInstance;
    return  Prc.at(prcAddress).then(function(instance) {
        prcInstance = instance;
        return prcInstance.getNumberOfMaterials.call()
      }).then(function(total) {
        return total;
      });
}
function getRegisterMaterial(id)
{
    var prcInstance;
    return Prc.at(prcAddress).then(function(instance) {
        prcInstance = instance;
        return prcInstance.getMaterialOfId.call(id).then(function(product) {
          console.log(product);
          var a = new Date(product[3] * 1000);
          var year = a.getFullYear();
          var month = a.getMonth();
          var date = a.getDate();
          var time = date + '/' + month + '/' + year;
          if(product[2]===sess.username)
          {
          return {
            id: id,
            name: product[0],
            code: product[1],
            owner: product[2],
            time: time,
            addr: product[4]
          }
        }
        })
      });
}
app.get('/showMaterial',async function(req, res)
{
    let products = [];
    let total = await getTotalMaterial();
    console.log(total)
    for (let i = 1; i <= total; i++) {
        let product = await getRegisterMaterial(i);
        products.push(product);
      }
      console.log(products);
      var datasend = JSON.stringify(products);
      res.send(datasend);

})
app.post('/addBatchMaterial',async function(req,res)
{
    console.log(req.body);
    var prcInstance;
    var bacAddress;
    var newTUC;
      //console.log(req.body);
      var materialBatch = req.body.materialBatch;
      var materialCode = req.body.materialCode;
      var materialFarm = sess.username;
      var materialCheckList = req.body.materialCheckList;
      var materialWeight = req.body.materialWeight;
      await Prc.at(prcAddress).then(async function(instance) {
        prcInstance = instance;
        return await prcInstance.getIdOfMaterialCode.call(materialCode);
      }).then(async function(idd) {
        id = idd;
        console.log(id);
        return await prcInstance.getMaterialOfId.call(id);
      }).then(async function(product) {
        bacAddress = await product[4];
      })
      Tuc.new({
        from: address,
        gas: defaultGas
      }).then(function(instance) {
        newTUC = instance.address;
      }).then(function() {
        console.log(bacAddress);
        Bac.at(bacAddress).then(function(instance) {
          bacInstance = instance;
          return bacInstance.addBatch(materialBatch, materialCode,materialWeight,materialCheckList,materialFarm,newTUC, {
            from: address,
            gas: defaultGas
          });
        }).then(function(txReceipt) {
          console.log(txReceipt);
          res.send(
            {
              status:"Thêm lô Nguyên liệu thành công",
              transactionHash: txReceipt.transactionHash
          }
            );
        });
      });
})
function getBatch(id,bacAddress) {
    var bacInstance;
    return Bac.at(bacAddress).then(function(instance) {
      bacInstance = instance;
      return bacInstance.getBatchOfId.call(id).then(function(batch) {
        var a = new Date(batch[5] * 1000);
        var year = a.getFullYear();
        var month = a.getMonth();
        var date = a.getDate();
        var time = date + '/' + month + '/' + year;
        return {
          id: id,
          batch: batch[0],
          codeMaterial: batch[1],
          farm: batch[2],
          checklist: batch[3],
          addr: batch[4],
          time: time
        }
      })
    });
  }
  
  // The number of all added batches
  function getTotalMaterialBatch(bacAddress) {
    var bacInstance;
    return Bac.at(bacAddress).then(function(instance) {
      bacInstance = instance;
      return bacInstance.getNumberOfBatchs.call()
    }).then(function(total) {
      return total;
    });
  }
app.post('/getBatchMaterial',async function(req,res)
{
    var materialCode = req.body.materialCode;
    var prcInstance;
    var bacAddress;
    let batchs = [];
    await Prc.at(prcAddress).then(async function(instance) {
        prcInstance = instance;
        return await prcInstance.getIdOfMaterialCode.call(materialCode);
      }).then(async function(idd) {
        id = idd;
        console.log(id);
        return await prcInstance.getMaterialOfId.call(id);
      }).then(async function(product) {
        bacAddress = await product[4];
      })
      let total = await getTotalMaterialBatch(bacAddress);
      console.log(total);
      for (let i = 1; i <= total; i++) {
        let batch = await getBatch(i,bacAddress);
        batchs.push(batch);
      }
      console.log(batchs);
      var datasend = JSON.stringify(batchs);
      res.send(datasend);
})
app.post('/createTransactionBatch',async function(req,res)
{
    console.log(req.body);
    var materialCode = req.body.materialCode;
    var materialBatch = req.body.materialBatch;
    var manufacture = req.body.manufacture;
    var materialFarm = sess.username;
    var bacAddress;
    var tucAddress;
    await Prc.at(prcAddress).then(function(instance) {
        prcInstance = instance;
        return prcInstance.getAddressOfMaterialCode.call(materialCode);
      }).then(function(a) {
        bacAddress = a;
        return Bac.at(bacAddress).then(function(instance) {
          bacInstance = instance;
          return bacInstance.getAddressOfBatch.call(materialBatch);
        }).then(function(b) {
          tucAddress = b;
        });
})
var transaction = await web3.eth.sendTransaction({
    from: address,
    to: receive,
    gas: defaultGas
  });
  var transactionHash =transaction.transactionHash ;
  Tuc.at(tucAddress).then(function(instance) {
    tucInstance = instance;
    return tucInstance.addTr(transactionHash,manufacture,materialFarm,{
      from: address,
      gas: defaultGas
    });
  }).then(function(txReceipt) {
      res.send("Giao dịch cập nhật thành công  ")
    console.log(txReceipt);
  })
})
app.post('/checkTransactionBatch',async function(req,res)
{
    var materialCode = req.body.materialCode;
    var materialBatch = req.body.materialBatch;
    var bacAddress;
    var tucAddress;
    await Prc.at(prcAddress).then(function(instance) {
        prcInstance = instance;
        return prcInstance.getAddressOfMaterialCode.call(materialCode);
      }).then(function(a) {
        bacAddress = a;
        return Bac.at(bacAddress).then(function(instance) {
          bacInstance = instance;
          return bacInstance.getAddressOfBatch.call(materialBatch);
        }).then(function(b) {
          tucAddress = b;
        });
})
Tuc.at(tucAddress).then(function(instance) {
    tucInstance = instance;
    return tucInstance.getTrOfId.call(1).then(function(tr) {
      console.log(tr);
        var a = new Date(tr[3] * 1000);
        var year = a.getFullYear();
        var month = a.getMonth();
        var date = a.getDate();
        var time = date + '/' + month + '/' + year;
     res.send({
      TUC : tucAddress,
      currentTx: tr[0],
      se: tr[1],
      re: tr[2],
      time: time
     })
    })
  });
})