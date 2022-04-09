const path = require('path')
const express = require('express')
const session = require('express-session')
const multer  = require('multer')
const upload = multer({ dest: './public/images/' })

require("dotenv").config();
const app = express()
app.use(session({
  name:"sid",
  secret: process.env.SESSIONSECURESTRING,
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite:false,
    secure: false }
}))

app.post('/upload/:filename', upload.single('filename'), (req, res) => {

  console.log(req.file)
  let filepath = null
  if(req.file){
    filepath = "/images/"+req.file.filename
  }
  res.send({
    "filename": req.params.filename,
    "filepath": filepath
  })

})

const user = require("./router/user");
const post = require("./router/post");
const sub = require("./router/sub");

app.use("/user", user);
app.use("/post", post);
app.use("/sub", sub);
const users = require('./db/users');
const port = process.env.PORT
const auth = require('./db/auth');
const groups = require('./db/groups');
const { is_authanticated } = require('./db/auth')
const { get_subs } = require('./db/groups')
const posts = require('./db/posts')
const { header, redirect } = require('express/lib/response')

app.use(express.urlencoded({ extended: true })); //Used fore parsing body elements
app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  res.render('pages/home', {
    title: 'subgroups',
    user:req.session.user,
    is_authenticated:  auth.is_authanticated(req.session),
    
    group:{
      current: await groups.get_group(15),
      parent:{"group_id":"2","group_name":"prent"},
      subs: await get_subs((await groups.get_group(15)).group_id)
      }
    })
  })

  
app.get('/user/profile',auth.authentication_required, async (req, res) => {

  res.render('pages/profile', {
    title: 'subgroups',
    user:req.session.user,
    is_authenticated: auth.is_authanticated(req.session),
  })
})


app.get('/group/:group_id', async (req, res) => {
  const group_id = req.params.group_id
  const current_group = await groups.get_group(group_id)
  
  if(current_group != undefined){
    const g_dropdown = {
      current:current_group,
      parent:{"group_id":"2","group_name":"parent"},
      subs:await get_subs((await groups.get_group(group_id)).group_id)}
    res.render('pages/group', {
      title: 'sub | '+ g_dropdown.current.group_name,
      user:req.session.user,
      is_authenticated:  auth.is_authanticated(req.session),
      group:g_dropdown,
      posts:await posts.get_post_by_group(group_id,req.session.user)
    })
    return;
    }
    

    res.render('pages/404', {
      title: 'register',
      is_authenticated:  auth.is_authanticated(req.session),
      user:req.session.user,
    })
  })

app.post('/group/new',auth.authentication_required, async (req, res) => {
  const group_name = req.body.groupname
  const parent_group_id =req.body.parent_group_id
  const user_id = req.session.user.user_id
  const new_group = await groups.create_group_under_parent(user_id,group_name,parent_group_id)
  if(new_group == undefined){
    res.redirect('/')
    return;
  }
  res.redirect('/group/'+new_group)
})

app.get('/login/',auth.allow_just_not_logged_in, (req, res) => {
  console.log("login page clicked") // delete after debug
  res.render('pages/login', {
    title: 'login',
  })
})

app.get('/register/',auth.allow_just_not_logged_in, (req, res) => {
  res.render('pages/register', {
    title: 'register',
    is_authenticated:  auth.is_authanticated(req.session),
  })
})

app.get('/logout/',auth.authentication_required, (req, res) => {
  req.session.user = null
  res.redirect('/')
})

app.post('/login/', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const remember_me = req.body.remember_me
  var message = null
  const authentication = await auth.authenticate(username,password,remember_me);
  req.session.user = authentication[0]
  message = authentication[1]
  if( auth.is_authanticated(req.session)){
    res.redirect("/")
  }else{
    res.render('pages/login', {
      title: 'login',
      message: message
    })}
  })

app.post('/register/', async (req, res) => {
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const passwordagain = req.body.passwordagain
  const register = await auth.register(username,email,password,passwordagain)
  res.render('pages/register', {
    title: 'register',
    is_authenticated: false,
    message: register[1],
  })}
)

app.get('*', function(req, res){
  res.render('pages/404', {
    title: 'register',
    is_authenticated:  auth.is_authanticated(req.session),
    user:req.session.user,
  })})

app.listen(port, () => {
  console.log(`subgroups app listening on port ${port}`)
})