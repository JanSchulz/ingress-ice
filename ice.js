/** 
 * @file Ingress-ICE, the main script
 * @author Nikitakun (https://github.com/nibogd)
 * @version 2.3.0
 * @license MIT
 * @see {@link https://github.com/nibogd/ingress-ice|GitHub }
 * @see {@link https://ingress.divshot.io/|Website }
 * @todo timestamp
 * @todo IITC
 */

//Initialize

var system   = require('system');
var args     = system.args;

/**
 * Check if all arguments are present
 * @function
 */
if (!args[11]) {
    console.log("Something went wrong. Please reconfigure ingress-ice (http://github.com/nibogd/ingress-ice for help)");
}
/**
 * Parse the config. Command-line parameters or from a file - if using a start script.
 * if the first argument is a string, use old config format
 * if the first argument is config version, use that version of config
 */
if (isNaN(args[1]) {
    var l            = args[1];
    var p            = args[2];
    var area         = args[3];
    var minlevel     = parseInt(args[4], 10);
    var maxlevel     = parseInt(args[5], 10);
    var v            = 1000 * parseInt(args[6], 10);
    var width        = parseInt(args[7], 10);
    var height       = parseInt(args[8], 10);
    var folder       = args[9];
    var ssnum        = args[10];
    var loglevel     = args[11];
} else if ((parseInt(args[1], 10)>=1) {
    var configver    = parseInt(args[1], 10);
    var l            = args[2];
    var p            = args[3];
    var area         = args[4];
    var minlevel     = parseInt(args[5], 10);
    var maxlevel     = parseInt(args[6], 10);
    var v            = 1000 * parseInt(args[7], 10);
    var width        = parseInt(args[8], 10);
    var height       = parseInt(args[9], 10);
    var folder       = args[10];
    var ssnum        = args[11];
    var loglevel     = args[12];
    var iitc         = parseInt(args[13], 10);
    var timestamp    = parseInt(args[14], 10);
}

/**
 * Counter for number of screenshots
 */
var curnum       = 0;
var version      = '2.3.0';

/**
 * Delay between logging in and checking if successful
 * @default
 */
var loginTimeout = 10 * 1000;

/**
 * twostep auth trigger
 */
var twostep      = 0;
var page         = require('webpage').create();

var val, message, Le;

/** @function setVieportSize */
page.viewportSize = {
    width: width + 42,
    height: height + 167
};

//Functions

/**
 * console.log() wrapper
 * @param {String} str - what to announce
 * @param {number} priority - if loglevel equals or higher than this, announce it
 */
function announce(str, priority) {
    if (loglevel>=priority) {
        console.log(getDateTime(0) + ': ' + str);
    }
}

/**
 * Returns Date and time
 * @param {number} format - the format of output, 0 for DD.MM.YYY HH:MM:SS, 1 for YYYY-MM-DD--HH-MM-SS (for filenames)
 * @returns {String} date
 */
function getDateTime(format) {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    if (format==1) {
        var dateTime = year+'-'+month+'-'+day+'--'+hour+'-'+minute+'-'+second;   
    } else {
        var dateTime = day + '.' + month + '.' + year + ' '+hour+':'+minute+':'+second; 
    }
    return dateTime;
};

/**
 * Sets minimal and maximal portal levels (filter) by clicking those buttons on filter panel. It's very laggy, not recommended.
 * @summary Portal level filter
 * @param {number} min - minimal portal level
 * @param {number} max - maximum portal level
 */
function setminmax(min, max) {
    var minAvailable = page.evaluate(function () { return document.querySelectorAll('.level_notch.selected')[0]});
    var maxAvailable = page.evaluate(function () { return document.querySelectorAll('.level_notch.selected')[1]});
    if (parseInt(minAvailable.id[10], 10)>min) {
        console.log('The minimal portal level is too low, using default. Consider setting it higher.');
    } else {
        var rect = page.evaluate(function() {
            return document.querySelectorAll('.level_notch.selected')[0].getBoundingClientRect();
        });
        page.sendEvent('click', rect.left + rect.width / 2, rect.top + rect.height / 2);
        //page.render('debug0.png');
        window.setTimeout(function() { 
            var rect1 = page.evaluate(function(min) {
                return document.querySelector('#level_low' + min).getBoundingClientRect();
            }, min);
            page.sendEvent('click', rect1.left + rect1.width / 2, rect1.top + rect1.height / 2);
            //page.render('debug1.png');
        }, v/30);
    };
    if (v<90000) {
        console.log('Custom highest portal level may work bad with low delay. If it doesn\'t work well, set a higher delay.');
    }
    if (max<8) {
        window.setTimeout(function() {
            var rect2 = page.evaluate(function() {
                return document.querySelectorAll('.level_notch.selected')[1].getBoundingClientRect();
            });
            page.sendEvent('click', rect2.left + rect2.width / 2, rect2.top + rect2.height / 2);
            //page.render('debug2.png');
            window.setTimeout(function() { 
                var rect3 = page.evaluate(function(min) {
                    return document.querySelector('#level_high' + min).getBoundingClientRect();
                }, max);
                page.sendEvent('click', rect3.left + rect3.width / 2, rect3.top + rect3.height / 2);
                //page.render('debug3.png');
                page.evaluate(function () {document.querySelector('#filters_container').style.display = 'none'});
                //page.render('debug4.png');
            }, v/30)}, v/20)};
};

/**
 * Screenshot wrapper
 */
function s() {
    announce(': screen saved', 2);
    page.render(folder + 'ice-' + getDateTime(1) + '.png');
};

/**
 * Quit if an error occured
 * @param {String} err - the error text
 */
function quit(err) {
    if (err) {
        announce('ICE crashed. Reason: ' + err + ' :(', 1); //nice XD
    } else {
        announce('Quit', 1);
    };
    phantom.exit();
};

/**
 * Check if all mandatory settings are correct and quit if not
 * @param {String} l - google login
 * @param {String} p - google password
 * @param {number} minlevel - minimal portal level
 * @param {number} maxlevel - maximal portal level
 * @param {String} area - Link to a place at the ingress map
 */
function checkSettings(l, p, minlevel, maxlevel, area) {
    if (!l | !p) {
        quit('you haven\'t entered your login and/or password');
    };
    if ((minlevel < 0 | minlevel > 8) | (maxlevel < 0 | maxlevel > 8) | (!minlevel | !maxlevel)) {
        quit('the lowest and/or highest portal levels were not set or were set wrong');
    };
    if (minlevel>maxlevel) {
        quit('lowest portal level is higher than highest. Isn\'t that impossible?!');
    };
    if (!area | area == 0) {
        quit('you forgot to set the location link, didn\'t you?');
    };
}

/**
 * Greeter. Long ASCII-art greeting if loglevel==3, else short welcome message.
 */
function greet() {
    if (loglevel==3) {
        console.log('     _____ )   ___      _____) \n    (, /  (__/_____)  /        \n      /     /         )__      \n  ___/__   /        /          \n(__ /     (______) (_____)  v' + version + ' (https://github.com/nibogd/ingress-ice)\n\nIf something doesn\'t work or if you want to submit a feature request, visit https://github.com/nibogd/ingress-ice/issues \nConnecting...');
    } else if (loglevel!=0) {
        console.log('Ingress ICE v' + version + ' starting...\nSee https://github.com/nibogd/ingress-ice for configuration.');
    }
}

/**
 * Log in to google
 * @param l - google login
 * @param p - google password
 */
function login(l, p) {
    page.evaluate(function (l) {
        document.getElementById('Email').value = l;
    }, l);
    
    page.evaluate(function (p) {
        document.getElementById('Passwd').value = p;
    }, p);
    
    page.evaluate(function () {
        document.querySelector("input#signIn").click();
    });
    
    page.evaluate(function () {
        document.getElementById('gaia_loginform').submit(); // Not using POST because the URI may change 
    });
}

/**
 * Check if logged in successfully, quit if failed, accept appEngine request if needed and prompt for two step code if needed.
 */
function checkLogin() {
    
    announce('URI is now ' + page.url.substring(0,40) + '... .\nVerifying login...', 4);
    
    if (page.url.substring(0,40) == 'https://accounts.google.com/ServiceLogin') {quit('login failed: wrong email and/or password')};
        
        if (page.url.substring(0,40) == 'https://appengine.google.com/_ah/loginfo') {
            announce('Accepting appEngine request...', 4);
            page.evaluate(function () {
                document.getElementById('persist_checkbox').checked = true;
                document.getElementsByTagName('form').submit();
            });
        };
        
        if (page.url.substring(0,40) == 'https://accounts.google.com/SecondFactor') {
            announce('Using two-step verification, please enter your code:', 1);
            twostep = system.stdin.readLine();
        };
        
        if (twostep) {
            page.evaluate(function (code) {
                document.getElementById('smsUserPin').value = code;
            }, twostep);
            page.evaluate(function () {
                document.getElementById('gaia_secondfactorform').submit();
            });
        };
}

/**
 * Screenshots counter
 * @param {number} curnum
 * @param {number} ssnum
 */
function count() {
    if ((curnum>=ssnum)&&(ssnum!=0)) {
        announce('Finished sucessfully. Exiting...\nThanks for using ingress-ice!', 1);
        phantom.exit();
    } else if (ssnum!=0) {
        announce('Screen #' + (curnum + 1) + '/' + ssnum + ' captured', 2);
        curnum++;
    }
}

/**
 * Hide debris on the map like selectors
 */
function hideDebris() {
    page.evaluate(function () {
        if (document.querySelector('#comm'))           {document.querySelector('#comm').style.display = 'none'};
                  if (document.querySelector('#player_stats'))   {document.querySelector('#player_stats').style.display = 'none'};
                  if (document.querySelector('#game_stats'))     {document.querySelector('#game_stats').style.display = 'none'};
                  if (document.querySelector('#geotools'))       {document.querySelector('#geotools').style.display = 'none'};
                  if (document.querySelector('#header'))         {document.querySelector('#header').style.display = 'none'};
                  if (document.querySelector('#snapcontrol'))    {document.querySelector('#snapcontrol').style.display = 'none'};
                  if (document.querySelectorAll('.img_snap')[0]) {document.querySelectorAll('.img_snap')[0].style.display = 'none'};
    });
    page.evaluate(function () {
        var hide = document.querySelectorAll('.gmnoprint');
        for (index = 0; index < hide.length; ++index) {
            hide[index].style.display = 'none';
        }});
}

/**
 * Adds a timestamp to a screenshot
 * @since 2.3.0
 */
function timestamp() {
    if 
}

/**
 * Prepare map for screenshooting. Make screenshots same width and height with map_canvas
 */
function prepare() {
    var selector = "#map_canvas";
    var elementBounds = page.evaluate(function(selector) {
        var clipRect = document.querySelector(selector).getBoundingClientRect();
        return {
            top:     clipRect.top,
            left:     clipRect.left,
            width:  clipRect.width,
            height: clipRect.height
        };
    }, selector);
    var oldClipRect = page.clipRect;
    page.clipRect = elementBounds;
}

/**
 * Main function. Wrapper for others.
 */
function main() {
    
    hideDebris();
    if ((minlevel>1)|(maxlevel<8)){
        setminmax(minlevel,maxlevel);
    } else {
        page.evaluate(function () {
            document.querySelector("#filters_container").style.display= 'none';
        });
    }
    
    window.setTimeout(function () {
        prepare();
        count();
        s();
        page.reload();
    }, v);
}
//MAIN SCRIPT

checkSettings(l, p, minlevel, maxlevel, area);
greet();

page.open('https://www.ingress.com/intel', function (status) {
    
    if (status !== 'success') {quit('cannot connect to remote server')};
          
          var link = page.evaluate(function () {
              return document.getElementsByTagName('a')[0].href; 
          });
          
          announce('Logging in...', 2);
          page.open(link, function () {
              
              login(l, p);
              
              window.setTimeout(function () {
                  checkLogin();
                  announce('Checking login...', 2);
                  window.setTimeout(function () {
                      page.open(area, function () {
                          main();
                          setInterval(function () {
                              main();
                          }, v);
                      });
                  }, loginTimeout);
              }, loginTimeout);
              
          });
});
