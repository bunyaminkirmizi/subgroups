const path = require('path')
const express = require('express')
const session = require('express-session')
const multer  = require('multer')

const upload = multer({ dest: './uploads/posts/',limits: { fileSize: 1000000*90 } })
const banner_upload = multer({ dest: './public/group_banners/',limits: { fileSize: 1000000*90 } })
const user_pp_upload = multer({ dest: './public/profile_photos/',limits: { fileSize: 1000000*90 } })

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

app.post('/group/changebanner/:group_id', banner_upload.single('group_banner_file'), (req, res) => {
  const group_id = req.params.group_id
  let filepath = null
  if(req.file){
    console.log(req.file)
    groups.add_banner(group_id,req.file.filename)
  }else{
    console.log("req.file didn't worked");
  }
  res.redirect('/group/'+group_id)
})
app.post('/user/changepp/:user_id', user_pp_upload.single('userpp'), async (req, res) => {
  const user_id = req.session.user.user_id
  let filepath = null
  if(req.file){
    const pp_path = req.file.filename
    await users.add_profile_photo(user_id,pp_path)
    //update session for profile photo
    req.session.user = await get_user_by_id(user_id)
  }else{
    console.log("req.file didn't worked");
  }
  res.redirect('/user/profile/')
})

const user = require("./router/user");
const post = require("./router/post");
const group = require("./router/group");

app.use("/user", user);
app.use("/post", post);
app.use("/group", group);

const port = process.env.PORT
const auth = require('./db/auth');
const groups = require('./db/groups');
const posts = require('./db/posts')
const { TreeNode } = require('./db/tree')
const stats = require('./db/stats')
const { info } = require('console')
const { is_authanticated, authentication_required } = require('./db/auth')
const { redirect } = require('express/lib/response')
const comments = require('./db/comments')
const { get_user_by_id } = require('./db/users')
const users = require('./db/users')
const { last_posts_from_public_groups } = require('./db/posts')

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
    // filter:{
    //   type:"up"
    // }
   })
    }
  )
  
app.get('/user/profile',auth.authentication_required, async (req, res) => {
  const user_id = req.session.user.user_id
  console.log(req.session.user)
  res.render('pages/profile', {
    title: 'subgroups',
    user:req.session.user,
    profile_user:await users.get_user_by_id(user_id),
    is_authenticated: auth.is_authanticated(req.session),
    last_posts: await posts.last_posts_by_user(user_id,5),
    last_comments: await comments.last_comments_by_user(user_id,5),
    user_post_count: await posts.user_post_count(user_id),
    user_comment_count: await comments.user_comment_count(user_id)
  })
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

app.get('/user/:user_id',auth.authentication_required, async (req, res) => {
  const user_id = req.params.user_id
  res.render('pages/otheruser', {
    title: 'subgroups',
    user:req.session.user,
    profile_user:await get_user_by_id(user_id),
    is_authenticated: auth.is_authanticated(req.session),
    last_posts: await posts.last_posts_by_user(user_id,5),
    last_comments: await comments.last_comments_by_user(user_id,5),
    user_post_count: await posts.user_post_count(user_id),
    user_comment_count: await comments.user_comment_count(user_id),

  })
})

app.get('/group/delete/:group_id',auth.authentication_required,group_ownership_required, async (req, res) => {
  const group_id = req.params.group_id
  req.query.group_id = group_id
  try{
    const parent = (await groups.get_parent(group_id))
    console.log('papapaprent==>',parent);
    await groups.delete_group(group_id)
    res.redirect('/group/'+parent.parent_group_id)
  }catch{
    console.log("can't get group parent")
    groups.delete_group(group_id)
    res.redirect('/')
    return;
  }
})

app.get('/group/:group_id', async (req, res) => {
  const group_id = req.params.group_id
  if(!(await groups.get_group(group_id))){
    //if group does not exist
    res.redirect('/')
    return;
  }
  let group_info = {
    is_participant: false,
    is_owner: false,
    banner: true,
    status:(await groups.get_status(group_id))
  }
  // console.log("satuususuusususu",)
  if(auth.is_authanticated(req.session)){
    const user_id = req.session.user.user_id
    group_info = {
      
      is_participant: await groups.is_participant(user_id,group_id),
      is_owner: await groups.is_owner(user_id,group_id),
      banner: false,
      status:(await groups.get_status(group_id))
    }
    console.log("group_info",group_info)
  }
  console.log('group info',group_info)
  const current_group = await groups.get_group(group_id)
  let tree = new TreeNode()
	await groups.recursive_group_traverse(group_id,tree)
  if(current_group != undefined){
    const g_dropdown = {
      current:current_group,
      parent:{"group_id":"2","group_name":"parent"},
      subs:await groups.get_subs((await groups.get_group(group_id)).group_id),
      parents: (await groups.get_parents(group_id,[])).reverse(),
      info: group_info
    }
    res.render('pages/group', {
      title: 'grup | '+ g_dropdown.current.group_name,
      user:req.session.user,
      is_authenticated:  auth.is_authanticated(req.session),
      group:g_dropdown,
      posts:await posts.get_post_by_group(group_id,req.session.user,req.query.filter),
      tree:tree,
      // message: req.message,
      filter: {name: req.query.filtername}
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

app.get('/group/join/:group_id',auth.authentication_required, async (req, res) => {
  const group_id =req.params.group_id
  const user_id = req.session.user.user_id
  
  await groups.join_group(user_id,group_id)
  console.log("joingroup=>",await groups.is_participant(user_id,group_id));
  res.redirect('/group/'+req.params.group_id)
})



async function group_ownership_required(req,res,next) {
	const user_id = req.session.user.user_id
	const group_id = req.params.group_id
	const group = await groups.get_group(group_id)
  console.log("group ownership check",user_id,group_id,group)
	if(group == undefined){
		res.redirect('/');
	}else if(group.user_id == user_id){
		next();
	}else{
		console.log("ownership rejected because group"+group_id+"owner is "+group.user_id+" but user"+user_id+" tried action")
		res.redirect('/');
	}
}

app.get('/group/makeprivate/:group_id',auth.authentication_required,group_ownership_required, async (req, res) => {
  const group_id =req.params.group_id
  const user_id = req.session.user.user_id
  
  groups.make_group_private(group_id)
  console.log("stastus", await groups.get_status(group_id));
  res.redirect('/group/'+req.params.group_id)
})

app.get('/group/makepublic/:group_id',auth.authentication_required,group_ownership_required, async (req, res) => {
  const group_id =req.params.group_id
  const user_id = req.session.user.user_id
  console.log("stastus",await groups.get_status(group_id));
  groups.make_group_public(group_id)
  // console.log("make_group_public=>",await groups.is_participant(user_id,group_id));
  res.redirect('/group/'+req.params.group_id)
})

app.get('/group/leave/:group_id',auth.authentication_required, async (req, res) => {
  const group_id =req.params.group_id
  const user_id = req.session.user.user_id
  await groups.leave_group(user_id,group_id)
  console.log("leavegroup=>",await groups.is_participant(user_id,group_id));
  res.redirect('/group/'+req.params.group_id)
})

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

app.post('/user/profile/changeabout/',auth.authentication_required, async (req, res) => {
  const profileabouttext = req.body.abouttext
  const user_id = req.session.user.user_id
  users.add_about_text(user_id,profileabouttext)
  res.redirect('/user/profile/')
  })

app.post('/group/changeabout/:group_id',auth.authentication_required, async (req, res) => {
  const group_about_text = req.body.groupabouttext
  const group_id = req.params.group_id
  groups.add_info(group_id,group_about_text)
  res.redirect('/group/'+group_id)
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