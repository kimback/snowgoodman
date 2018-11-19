module.exports = function(app, querystring)
{
    	 
	//--------------라우터---------------------
	 //index
	 app.get('/index',function(req,res){
        res.render('index.html');
     });
	 
	//인증1
	app.get('/*auth1result*', function(req, res){
		console.log('-------------auth1result-----------');
		console.log(req.query); //인증받은값
		
		postData = querystring.stringify({
		'client_id' : '29632', //개발단id
		'client_secret' : '1ea7a6e9fc6933ce50addb2eedbdca22b30500ed', //개발단pw
		'code' : req.query.code,
		'grant_type' : 'authorization_code'
		});
			
		console.log(postData);
		//인증2
		requestAuth2(req, res);
		
	});
	
	//인증후 액션화면
	app.get('/action', function(req, res){
		console.log('-------------action-----------');
		
		fs.readFile('/', 'utf8', function(err, text){
			res.send(text);
		});
	});



	//-------------라우터----------------------
	
	

}
