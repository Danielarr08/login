var express=require("express");
var path=require("path");
var cors =require('cors');
var usuariosRutas=require("./rutas/usuariosRutas");
var productosRutas=require("./rutas/productosRutas");
var usuariosRutasApi=require("./rutas/usuariosRutasApi");
var productosRutasApi=require("./rutas/productosRutasApi");
//var loginRutas=require("./rutas/loginRutas");

var app=express();
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
app.use("/", express.static(path.join(__dirname,"/web")));
app.use(cors());
app.use("/", usuariosRutas, productosRutas,usuariosRutasApi, productosRutasApi);
var port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log("Servidor en http://localhost:"+port);
});
