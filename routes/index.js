var express = require('express');
var moment = require('moment');
var router = express.Router();
var app = new express();
const crypto = require('crypto');
/* GET home page. */
router.get('/', function(req, res, next) {
  let arts = global.dbHandel.getModel('article');
/*   res.locals.dateFormat = function(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  } */
  arts.find(function(err,docs){
      res.render('index',{ 
        webname: 'new project' ,
        contents:docs,
        user:req.session.user
    });
  })
});

/* router.get('/blog/:id',function(req,res,next){
  console.log(req.params);
}); */

/* GET artList && search page. */
router.get('/blog/',function(req,res,next){
  let arts = global.dbHandel.getModel('article');
   if(req.query.id){
    arts.findOne({_id:req.query.id},function(err,doc){
       res.render('art_details',{art:doc,user:req.session.user})
    }) 
   }else{
     res.send('文章未找到')
   }
  
});
/*  发表评论 */
router.post('/blog/new_comment',function(req,res){
    let name = req.body.name;
    let msg = req.body.msg;
    let _id = req.body._id;
    let arts = global.dbHandel.getModel('article');
    arts.update({_id},{$push:{
      comments:{
        name,
        body:msg,
        date:Date.now(),
      }
    }},(err,doc)=>{
      res.send(200);
    })
})


router.route("/register").get(function(req,res){    // 渲染注册页面
  res.render("register",{title:'User register'});
}).post(function(req,res){ 
   //从数据库中获取user集合对象;
  var User = global.dbHandel.getModel('user');
  var uname = req.body.uname;
  var password = crypto.createHash('md5').update(req.body.upwd, 'utf-8').digest('hex');
  User.findOne({name: uname},function(err,doc){ 
      if(err){ 
          res.send(500);
          req.session.error =  '网络异常错误！';
      }else if(doc){ 
          req.session.error = '用户名已存在！';
          res.send(500);
      }else{ 
          User.create({                             // 创建一组user对象到数据库中
              name: uname,
              password: password
          },function(err,doc){ 
               if (err) {
                      res.send(500);
                      //console.log(err);
                  } else {
                      req.session.error = '用户名创建成功！';
                      res.send(200);
                  }
                });
      }
  });
});


/* GET login page. */
router.route("/login").get(function(req,res){
  //session存在,直接渲染home页;    
  if(req.session.user)res.redirect('/home');
  res.render("login",{title:'User Login'});
}).post(function(req,res){        
  var User = global.dbHandel.getModel('user');  
  var password = crypto.createHash('md5').update(req.body.upwd, 'utf-8').digest('hex'); 
  User.findOne({name:req.body.uname},(err,doc)=>{
    if(!err && !doc){
      console.log('错误');
      req.session.error = '用户名不存在';
      res.status(500);
      res.send(req.session.error)
    }else if(!doc){
      console.log('用户名不存在');
      req.session.error = '用户名不存在';
      res.send(404);
    }else if(doc){
      if(password != doc.password){
        res.status(404);
        req.session.error = "密码错误";
        res.send(req.session.error);
      }else{
        req.session.user = doc;
        res.send(200);
        console.log(req.session.user);
      }
    }
  })
});

/* GET home page. */

router.get('/home',function(req,res){
  if(!req.session.user){
    req.session.error = '请先登录',
    res.redirect('/login');
  }
  let arts = global.dbHandel.getModel('article');
  arts.find({belong_to:req.session.user._id}).count(function(err,count){
    res.render('home',{title:'Home',user:req.session.user,art_count:count})
  })
})

/* GET logout page. */

router.get('/logout',function(req,res){
  req.session.user = '';
  req.session.error = '';
  res.redirect('/');
})

/* GET art_publish page. */
router.route("/home/art_publish").get(function(req,res){    
  if(!req.session.user){
    req.session.error = '请先登录',
    res.redirect('/login');
  }

  res.render('art_publish',{title:'Home',user:req.session.user})

}).post(function(req,res){ 
  var Arts = global.dbHandel.getModel('article');
  var zTitle = req.body.title;
  var zContent = req.body.body;
  Arts.create({
    title:zTitle,
    body:zContent,
    author:req.session.user.name,
    date:Date.now(),
    belong_to:req.session.user._id,
    comments:[]
  },function(err,doc){
    if(err){
      res.send(500);
      res.send('发布失败');
    }else{
      res.send(200);
    }
  })
});

/* GET art_list page. */
router.route("/home/art_list").get(function(req,res){    
  if(!req.session.user){
    req.session.error = '请先登录',
    res.redirect('/login');
  }
  let arts = global.dbHandel.getModel('article');
  arts.find({belong_to:req.session.user._id},function(err,body){
    res.render('art_list',{title:'Home',user:req.session.user,art_content:body})
  })
}).post(function(req,res){ 
  let arts = global.dbHandel.getModel('article');
  var zTitle = req.body.title;
  var zContent = req.body.body;
  var zId = req.body._id;
  arts.update({
    _id:zId
  },{
    title:zTitle,
    body:zContent,
    date:Date.now(),
  },function(err){
    if(err){
      res.status(500);
      res.send('服务器无响应')
    }else{
      res.send(200);
    }
  })
});

/* edit */
router.get('/home/art_list/edit',function(req,res){
  let arts = global.dbHandel.getModel('article');
  var zId = req.query._id;
  arts.findOne({_id:zId},function(err,doc){
      res.status(200).json({
        _id:doc._id,
        title:doc.title,
        body:doc.body
      })
  })
})

/* delel  */
router.post('/home/art_list/del',function(req,res){
  if(!req.session.user){
    req.session.error = '请先登录',
    res.redirect('/login');
  }
  let arts = global.dbHandel.getModel('article');
  var zId = req.body._id;
  arts.remove(
    {_id:zId},function(err){
    if(err){
      res.status(500);
      res.send('服务器无响应')
    }else{
      res.send(200);
    }
  })

});
module.exports = router;
