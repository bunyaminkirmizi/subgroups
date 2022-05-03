const path = require('path')
const express = require('express')
const session = require('express-session')
const multer  = require('multer')
const upload = multer({ dest: './uploads/posts/',limits: { fileSize: 1000000*90 } })
const banner_upload = multer({ dest: './public/group_banners/',limits: { fileSize: 1000000*90 } })

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

const user = require("./router/user");
const post = require("./router/post");
const group = require("./router/group");
const message = require("./router/message");

app.use("/user", user);
app.use("/message", message);
app.use("/post", post);
app.use("/group", group);

const port = process.env.PORT
const auth = require('./db/auth');
const groups = require('./db/groups');
const posts = require('./db/posts')
const stats = require('./db/stats')
app.use(express.urlencoded({ extended: true })); //Used fore parsing body elements
app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  if(auth.is_authanticated(req.session)){
    const user_id = req.session.user.user_id
    res.render('pages/userhome', {
      title: 'subgroups',
      user:req.session.user,
      is_authenticated:  true,
      groups_user_joined: await groups.get_user_participant_groups(user_id),
      posts_from_user_joined_groups: await posts.get_user_joined_group_posts(user_id),
      user_owned_groups: await groups.get_user_owned_groups(user_id),
      last_posts_from_public_groups: await posts.last_posts_from_public_groups(5),
      new_groups: await groups.new_groups(5)
     })
     return;
  }
  
  console.log("entered homepage")
  res.render('pages/home', {
    title: 'subgroups',
    user:req.session.user,
    is_authenticated:  auth.is_authanticated(req.session)
    ,statistics: await stats.lastweek()
   })
    }
  )
  

  app.post('/upload/:filename', upload.single('filename'), (req, res) => {
  
    let filepath = null
    if(req.file){
      console.log("file uploaded"+req.file.filename)
      filepath = "/post/uploads/posts/"+req.file.filename
    }else{
      console.log("req.file didn't worked");
    }
    res.send({
      "filename": req.params.filename,
      "filepath": filepath
    })
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

app.get('/login/',auth.allow_just_not_logged_in, (req, res) => {
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

app.get('/howto', async (req, res) => {
  // const user_id = req.session.user.user_id
  console.log(req.session.user)
  res.render('pages/howto.pug', {
    title: 'nasıl kullanırım?',
    user:req.session.user,
    is_authenticated: auth.is_authanticated(req.session),
  })
})

app.get('/about/', function(req, res){
  res.render('pages/about', {
    title: 'Hakkında',
    is_authenticated:  auth.is_authanticated(req.session),
    user:req.session.user,
  })})

app.get('*', function(req, res){
  res.render('pages/404', {
    title: 'Sayfa bulunamadı',
    is_authenticated:  auth.is_authanticated(req.session),
    user:req.session.user,
  })})

app.listen(port, () => {
  console.log(`subgroups app listening on port ${port}`)
})