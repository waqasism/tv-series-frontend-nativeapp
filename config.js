
var consumedMinutesReportingInterval = 20000;		//in milli seconds
var userAllo = false;  //flag for Allo only users
var userRop = false;  //flag for ROP only users
var userBase = false; //flag for base only users
var alloUser = false;
var checkLiveTvLicense = true;
var usernameCookieDurationNormal = 30;      //number of days, set 0 for session cookie
var usernameCookieDurationRemember = 365;      //number of days
var serviceUserName = null, servicePassword = null, webserviceUrl = null, webui_v = 1.0, gigyaAPIkey = null;

/**DEVEL SERVER***/
if(serverEnv == 'devel'){
	serviceUserName = 'betaserver';
	servicePassword = 'b3t4';
	webserviceUrl = 'http://127.0.0.1';
	gigyaAPIkey = '3_nD3UMvLJDblEtMKkXoSGizYHRSgSjz6i8cHa1-rf86ypx5TVhBm73dsaUHSeGyM-';
}

/**PRE-PROD SERVER***/
if(serverEnv == 'preprod'){
	serviceUserName = 'test';
	servicePassword = 'test123';
	webserviceUrl = 'http://127.0.0.1';
	gigyaAPIkey = '3_nD3UMvLJDblEtMKkXoSGizYHRSgSjz6i8cHa1-rf86ypx5TVhBm73dsaUHSeGyM-';
}

/**PROD SERVER***/
if(serverEnv == 'prod'){
	serviceUserName = 'betaserver';
	servicePassword = 'b3t4';
	webserviceUrl = 'http://localhost:8000';
	gigyaAPIkey = '3_V0iP4JOwnKoZIYZgve78R87NM9eEY54SP_8dI-6iT-cjlkEKAAf8NpB0dYSTY2I7';
}

