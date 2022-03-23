if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express=require('express')
const mongoose = require('mongoose')
const passport=require('passport');
const LocalStrategy=require('passport-local')
const app = express();
const User = require('./models/user')
const Product = require('./models/product')
const path=require('path');
const session = require('express-session');
const methodOverride=require('method-override')
const ejsMate=require('ejs-mate');
const multer  = require('multer')
const Order = require('./models/orders')
const {storage}=require('./cloudinary')
const upload = multer({storage })
const swal=require('sweetalert')
const MongoStore = require('connect-mongo')
const db=process.env.DB_URL;
const flash = require('connect-flash')
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
.then( () => {
    console.log("Connection open")
}).catch(err => {
    console.log("OOPS !! ERROR")
})
const secret=process.env.secret||'secret'
const store=new  MongoStore({
    mongoUrl:db,
    secret,
    ttl:24*60*60
})
store.on('error',(e)=>{
    console.log("Session store error")
})
const sessionConfig = {
    store,
    secret,
    name:'FABROMEN',
    resave:false,
    saveUnitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*32*7,
        maxAge:1000*60*60*32*7,
    }
}
app.use(session(sessionConfig))
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(flash())
app.use((req,res,next)=>{
    res.locals.currentUser=req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.engine('ejs',ejsMate)
app.set("view engine",'ejs')
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'))
app.get('/',(req,res)=>{
    res.redirect('/login')
})
app.get('/home',async(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    const product = await Product.find()
    res.render('home',{product})
})
app.get('/cart',async(req,res)=>{
    const user=await User.findById(req.user._id).populate('orders');
    res.render('cart',{user})
})
app.get('/delivery',async(req,res)=>{
    const order= await Order.find({}).populate('customer');
    res.render('deliver',{order})
})
app.get('/delivery/:id/:orderId',async(req,res)=>{
    const {id,orderId}=req.params;
    const user= await User.findById(id).populate('orders')
    res.render('delivery2',{user,orderId})
})
app.get('/products',(req,res)=>{
    res.render("product")
})
app.get('/products/:id',async(req,res)=>{
    const {id}=req.params;
    const user =  await User.findById(req.user._id)
    if(!user.otp){
           user.otp= Math.floor(100000 + Math.random() * 900000);
    }
    user.display=0;
    const product = await Product.findById(id);
    user.orders.push(product)
    await user.save();
    req.flash('success',`Added to cart`);
    res.redirect('/home')
})
app.get('/remove/:id',async(req,res)=>{
    const {id}=req.params
    const user =await User.findById(req.user._id)
    const product= await Product.findById(id);
    user.orders.remove(product);
    await user.save();
    req.flash("success",'Removed succesfully');
    res.redirect("/cart")
})
app.post('/order',async(req,res)=>{
        const {address}=req.body;
        const user= await User.findById(req.user._id);
        user.address=address.trim();
        await user.save();
        req.flash("success",'Address Added')
        res.redirect('/cart')
})
app.post('/products',upload.array('image'),(req,res)=>{
    const product = new Product(req.body.product);
    product.image= req.files.map(f=>({url:f.path,filename:f.filename}));
    product.save();
    res.redirect('/home')
})
app.get('/buy',async(req,res)=>{
    const order = new Order()
    const user= await User.findById(req.user._id);
    user.display=1;
    order.customer=req.user._id;
    await user.save();
    await order.save();
    req.flash("success",'Succesfully placed on order');
    res.redirect('/home')
})
app.delete('/verify/:id/:orderId',async(req,res)=>{
    const {id,orderId}=req.params;
    const user =await User.findById(id).populate('orders');
    const {otp}=req.body;
    const len = user.orders.length;
    if(user.otp==otp){
        user.display=0;
        user.orders.splice(0,len);
        const order = await Order.findByIdAndDelete(orderId);
        req.flash('success','Verified succesfully');
    }else{
        req.flash("error",'Not verified');
    }
    await user.save();
 
    res.redirect('/delivery')
})

app.get('/login',(req,res)=>{
    if(req.isAuthenticated()){
       return res.redirect('/home')
    }
    res.render('login')
})
app.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash("success",'Login succesfull')
    res.redirect('/home');
})
app.get('/register',(req,res)=>{
    res.render('register')
})
app.post('/register',async(req,res)=>{
    try{
        const {email,username,password,phone}=req.body;
        const user = new User({username,email,phone})
        const newUser=await User.register(user,password);
        req.login(newUser,err =>{
            if(err) return next(err);
         
            return res.redirect('/home');
        })
        }catch(e){
            req.flash('error',e.message);
            res.redirect('/register')
        }

})
app.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/login');
})
const port = process.env.PORT ||8080
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})