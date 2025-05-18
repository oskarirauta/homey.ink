var CLIENT_ID = '5cbb504da1fc782009f52e46';
var CLIENT_SECRET = 'gvhs0gebgir8vz8yo2l0jfb49u9xzzhrkuo1uvs8';

function fillData() {

  try {

    var homey;
    var me;

    var nameChange = false;
    var zoom = 1;

    var $sliderpanel = document.getElementById('slider-panel');
    var $slider = document.getElementById('slider');
    var $sliderclose = document.getElementById('slider-close');
    var $slidericon = document.getElementById('slider-icon');
    var $slidercapability = document.getElementById('slider-capability');
    var $slidername = document.getElementById('slider-name');
    var $slidervalue = document.getElementById('slider-value');


    var $textLarge = document.getElementById('text-large');
    var $textSmall = document.getElementById('text-small');
    var $logo = document.getElementById('logo');
    var $weatherTemperature = document.getElementById('weather-temperature');
    var $weatherState = document.getElementById('weather-state');
    var $flowsInner = document.getElementById('flows-inner');
    var $devicesInner = document.getElementById('devices-inner');

    $logo.addEventListener('click', function () {
      window.location.reload();
    });

    renderText();
    later.setInterval(function () {
      renderText();
    }, later.parse.text('every 1 hour'));

    var api = new AthomCloudAPI({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    var theme = getQueryVariable('theme');
    var $css = document.createElement('link');
    $css.rel = 'stylesheet';
    $css.type = 'text/css';
    $css.href = './css/themes/' + theme + '.css';
    document.head.appendChild($css);

    var token = getQueryVariable('token');
    if (!token) {
      throw new Error('Missing ?token=... ');
    }

    token = atob(token);
    token = JSON.parse(token);
    api.setToken(token);

    api.isLoggedIn().then(function (loggedIn) {
      if (!loggedIn)
        throw new Error('Token Expired. Please log-in again.');
    }).then(function () {
      return api.getAuthenticatedUser();
    }).then(function (user) {
      return user.getFirstHomey();
    }).then(function (homey) {
      return homey.authenticate();
    }).then(function (homey_) {
      homey = homey_;

      renderHomey();
      later.setInterval(function () {
        renderHomey();
      }, later.parse.text('every 1 hour'));
    }).catch(function (err) {
      console.error(err);
      document.write('<pre>Error: ' + err.message + '\n' + err.stack);
    });

    function renderHomey() {
      homey.users.getUserMe().then(function (user) {
        me = user;
        me.properties = me.properties || {};
        me.properties.favoriteFlows = me.properties.favoriteFlows || [];
        me.properties.favoriteDevices = me.properties.favoriteDevices || [];

        homey.weather.getWeather().then(function (weather) {
          return renderWeather(weather);
        }).catch(console.error);

        homey.flow.getFlows().then(function(flows) {
          var favoriteFlows = me.properties.favoriteFlows.map(function(flowId){
            return flows[flowId];
          }).filter(function(flow){
            return !!flow;
          });
          return renderFlows(favoriteFlows);
        }).catch(console.error);

/*
        // unimplemented
        homey.alarms.getAlarms().then(function(alarms) {
          return renderAlarms(alarms);
        }).catch(console.error);
*/

        homey.devices.getDevices().then(function(devices) {
          var favoriteDevices = me.properties.favoriteDevices.map(function(deviceId){
            return devices[deviceId];
          }).filter(function(device){
            return !!device;
          }).filter(function(device){
            if(!device.ui) return false;
            //if(!device.ui.quickAction) return false;
            return true;
          });


          favoriteDevices.forEach(function(device){
            // console.log(device.name)
            // console.log(device.capabilitiesObj)
            if (!device.ready) {
              faultyDevice=true;
              $sensordetails.classList.add('fault')
              return
            }
/*
            if ( device.ui.quickAction ) {
              device.makeCapabilityInstance(device.ui.quickAction, function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('on', !!value);
                }
              });
            }
*/
            if ( device.capabilitiesObj.locked ) {
              device.makeCapabilityInstance('locked', function(value){
                var $valueElement = document.getElementById('lock:' + device.id);
                if( $valueElement ) {
                  console.log("Locked: " + value)
                  $valueElement.classList.toggle('locked', !!value);
                  $valueElement.classList.toggle('unlocked', !value);
                }
              });
            }
            if ( device.capabilitiesObj.alarm_generic ) {
              device.makeCapabilityInstance('alarm_generic', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('alarm', !!value);
                  checkSensorStates();
                }
              });
            }
            if ( device.capabilitiesObj.alarm_motion ) {
              device.makeCapabilityInstance('alarm_motion', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('alarm', !!value);
                  checkSensorStates();
                }
              });
            }
            if ( device.capabilitiesObj.alarm_contact ) {
              device.makeCapabilityInstance('alarm_contact', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('alarm', !!value);
                  checkSensorStates();
                }
              });
            }
            if ( device.capabilitiesObj.alarm_connected ) {
              device.makeCapabilityInstance('alarm_connected', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('away', !value);
                  checkSensorStates();
                }
              });
            }
            if ( device.capabilitiesObj.alarm_night ) {
              device.makeCapabilityInstance('alarm_night', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('day', !value);
                }
              });
            }
            if ( device.capabilitiesObj.alarm_vibration ) {
              device.makeCapabilityInstance('alarm_vibration', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  $deviceElement.classList.toggle('alarm', !!value);
                  checkSensorStates();
                }
              });
            }
            if ( device.capabilitiesObj.measure_temperature ) {
              device.makeCapabilityInstance('measure_temperature', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_temperature");
                  capability = device.capabilitiesObj['measure_temperature']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.target_temperature ) {
              device.makeCapabilityInstance('target_temperature', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":target_temperature");
                  capability = device.capabilitiesObj['target_temperature']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                  if (device.name=="Bier") {renderValue($valueElement, capability.id, capability.value, "")}
                }
              });
            }
            if ( device.capabilitiesObj.measure_humidity ) {
              device.makeCapabilityInstance('measure_humidity', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_humidity");
                  capability = device.capabilitiesObj['measure_humidity']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_pressure ) {
              device.makeCapabilityInstance('measure_pressure', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_pressure");
                  capability = device.capabilitiesObj['measure_pressure']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_luminance ) {
              device.makeCapabilityInstance('measure_luminance', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_luminance");
                  capability = device.capabilitiesObj['measure_luminance']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            // new 1.1.1.9
            if ( device.capabilitiesObj.measure_gust_strength ) {
              device.makeCapabilityInstance('measure_gust_strength', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_gust_strength");
                  capability = device.capabilitiesObj['measure_gust_strength']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_rain ) {
              device.makeCapabilityInstance('measure_rain', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_rain");
                  capability = device.capabilitiesObj['measure_rain']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_rain_day ) {
              device.makeCapabilityInstance('measure_rain_day', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_rain_day");
                  capability = device.capabilitiesObj['measure_rain_day']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_solarradiation ) {
              device.makeCapabilityInstance('measure_solarradiation', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_solarradiation");
                  capability = device.capabilitiesObj['measure_solarradiation']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_uv ) {
              device.makeCapabilityInstance('measure_uv', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_uv");
                  capability = device.capabilitiesObj['measure_uv']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_wind_angle ) {
              device.makeCapabilityInstance('measure_wind_angle', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_wind_angle");
                  capability = device.capabilitiesObj['measure_wind_angle']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_wind_strength ) {
              device.makeCapabilityInstance('measure_wind_strength', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_wind_strength");
                  capability = device.capabilitiesObj['measure_wind_strength']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            // /new 1.1.1.9
            if ( device.capabilitiesObj.measure_power ) {
              device.makeCapabilityInstance('measure_power', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_power");
                  capability = device.capabilitiesObj['measure_power']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.meter_power ) {
              device.makeCapabilityInstance('meter_power', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":meter_power");
                  capability = device.capabilitiesObj['meter_power']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_current ) {
              device.makeCapabilityInstance('measure_current', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_current");
                  capability = device.capabilitiesObj['measure_current']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_voltage ) {
              device.makeCapabilityInstance('measure_voltage', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_voltage");
                  capability = device.capabilitiesObj['measure_voltage']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.meter_gas ) {
              device.makeCapabilityInstance('meter_gas', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":meter_gas");
                  capability = device.capabilitiesObj['meter_gas']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.measure_water ) {
              device.makeCapabilityInstance('measure_water', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":measure_water");
                  capability = device.capabilitiesObj['measure_water']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.daily_production ) {
              device.makeCapabilityInstance('daily_production', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":daily_production");
                  capability = device.capabilitiesObj['daily_production']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.production ) {
              device.makeCapabilityInstance('production', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":production");
                  capability = device.capabilitiesObj['production']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.dim ) {
              device.makeCapabilityInstance('dim', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":dim");
                  capability = device.capabilitiesObj['dim']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.volume_set ) {
              device.makeCapabilityInstance('volume_set', function(value){
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement ) {
                  var $valueElement = document.getElementById('value:' + device.id + ":volume_set");
                  capability = device.capabilitiesObj['volume_set']
                  renderValue($valueElement, capability.id, capability.value, capability.units)
                }
              });
            }
            if ( device.capabilitiesObj.flora_measure_moisture ) {
              device.makeCapabilityInstance('flora_measure_moisture', function(value) {
                var $deviceElement = document.getElementById('device:' + device.id);
                var moisture = value;
                if( $deviceElement) {
                  var $element = document.getElementById('value:' + device.id +":flora_measure_moisture");
                  $element.innerHTML = Math.round(moisture) + "<span id='decimal'>%</span><br />"
                  console.log(moisture)
                  if ( moisture < 15 || moisture > 65 ) {
                    console.log("moisture out of bounds")
                    $deviceElement.classList.add('alarm')
                    selectValue(device, $element)
                    selectIcon($element, $element.id, device, device.capabilitiesObj['flora_measure_moisture'])
                  } else {
                    $deviceElement.classList.remove('alarm')
                  }
                  checkSensorStates();
                }
              });
            }
            if ( device.capabilitiesObj.flora_measure_fertility ) {
              device.makeCapabilityInstance('flora_measure_fertility', function(fertility) {
                var $deviceElement = document.getElementById('device:' + device.id);
                if( $deviceElement) {
                  var $element = document.getElementById('value:' + device.id +":flora_measure_fertility");
                  $element.innerHTML = Math.round(fertility) + "<span id='decimal'>%</span><br />"
                }
              });
            }
          });

          return renderDevices(favoriteDevices)
        }).catch(console.error);
      }).catch(console.error);
    }

    function renderWeather(weather) {
      $weatherTemperature.innerHTML = Math.round(weather.temperature);
      $weatherState.innerHTML = weather.state;
    }

    function renderFlows(flows) {
      $flowsInner.innerHTML = '';
      flows.forEach(function (flow) {
        var $flow = document.createElement('div');
        $flow.id = 'flow-' + flow.id;
        $flow.classList.add('flow');
        $flow.addEventListener('click', function () {
          if ($flow.classList.contains('running')) return;

          homey.flow[flow.cards ? 'triggerAdvancedFlow' : 'triggerFlow']({
            id: flow.id,
          }).then(function () {

            $flow.classList.add('running');
            setTimeout(function () {
              $flow.classList.remove('running');
            }, 3000);
          }).catch(console.error);
        });
        $flowsInner.appendChild($flow);

        var $play = document.createElement('div');
        $play.classList.add('play');
        $flow.appendChild($play);

        var $name = document.createElement('div');
        $name.classList.add('name');
        $name.innerHTML = flow.name;
        $flow.appendChild($name);
      });
    }

  function renderDevices(devices) {
    $devicesInner.innerHTML = '';
    devices.forEach(function(device) {
      if (!device.ready) {return}
      var $deviceElement = document.createElement('div');
      $deviceElement.id = 'device:' + device.id;
      $deviceElement.classList.add('device');
      $deviceElement.classList.toggle('on', device.capabilitiesObj && device.capabilitiesObj[device.ui.quickAction] && device.capabilitiesObj[device.ui.quickAction].value === true);
      if ( device.capabilitiesObj && device.capabilitiesObj.button ) {
        $deviceElement.classList.toggle('on', true)
      }
      $devicesInner.appendChild($deviceElement);

      if (device.capabilitiesObj && device.capabilitiesObj.alarm_generic && device.capabilitiesObj.alarm_generic.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_motion && device.capabilitiesObj.alarm_motion.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_contact && device.capabilitiesObj.alarm_contact.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_vibration && device.capabilitiesObj.alarm_vibration.value
          ) {
            $deviceElement.classList.add('alarm')
      }

      if ( device.capabilitiesObj && device.capabilitiesObj.flora_measure_moisture ) {
        var moisture = device.capabilitiesObj.flora_measure_moisture.value
        console.log(moisture)
        if ( moisture < 15 || moisture > 65 ) {
          console.log("moisture out of bounds")
          $deviceElement.classList.add('alarm')
          //selectValue(device, $element)
          //selectIcon($element, $element.id, device, device.capabilitiesObj['flora_measure_moisture'])
        }
      }

      if ( device.capabilitiesObj && device.capabilitiesObj.alarm_connected ) {
        if ( device.capabilitiesObj.alarm_connected.value ) {
          $deviceElement.classList.remove('away')
        } else {
          $deviceElement.classList.add('away')
        }
      }

      if ( device.capabilitiesObj && device.capabilitiesObj.alarm_night ) {
        if ( device.capabilitiesObj.alarm_night.value ) {
          $deviceElement.classList.remove('day')
        } else {
          $deviceElement.classList.add('day')
        }
      }

      var $icon = document.createElement('div');
      $icon.id = 'icon:' + device.id
      $icon.classList.add('icon');
      if ( device.iconObj ) {
        $icon.style.webkitMaskImage = 'url(https://icons-cdn.athom.com/' + device.iconObj.id + '-128.png)';
      } else if ( device.icon ) {
        $icon.style.webkitMaskImage ='url(img/capabilities/blank.png)';
      }
      if ( device.name == "Bier" || device.name == "Bier temperatuur" ) {
        $icon.style.webkitMaskImage = 'url(img/capabilities/beer.png)';
        $icon.style.backgroundImage = 'url(img/capabilities/beer.png)';
        $icon.style.backgroundSize = 'contain'
      }

      $deviceElement.appendChild($icon);

      var $iconCapability = document.createElement('div');
      $iconCapability.id = 'icon-capability:' + device.id
      $iconCapability.classList.add('icon-capability');
      $iconCapability.style.webkitMaskImage ='url(img/capabilities/blank.png)';
      $deviceElement.appendChild($iconCapability);

      if ( device.capabilitiesObj ) {
        itemNr = 0
        for ( item in device.capabilitiesObj ) {
          capability = device.capabilitiesObj[item]
          if ( capability.type == "number"  ) {
            var $value = document.createElement('div');
            $value.id = 'value:' + device.id + ':' + capability.id;
            $value.title = capability.title
            $value.classList.add('value');
            selectIcon($value, getCookie(device.id), device, capability)
            //selectIcon($value, device.id, device, capability)
            renderValue($value, capability.id, capability.value, capability.units)
            if (device.name=="Bier") {renderValue($value, capability.id, capability.value, "")}
            $deviceElement.appendChild($value)
            itemNr =itemNr + 1
          } else 
          if ( capability.id == "locked" ) {
            var $lock = document.createElement('div');
            $lock.id = 'lock:' + device.id
            $lock.title = capability.title
            $lock.classList.add('icon-capability-lock');
            if ( device.capabilitiesObj.locked.value ) {
              $lock.classList.add('locked');
            } else {
              $lock.classList.add('unlocked');
            }
            $deviceElement.appendChild($lock)
            itemNr =itemNr + 1
          }
        }
        if ( itemNr > 0 ) {
          // start touch/click functions
          $deviceElement.addEventListener('touchstart', function(event) {
            deviceStart($deviceElement, device, event)
          });
          $deviceElement.addEventListener('mousedown', function(event) {
            deviceStart($deviceElement, device, event)
          });

          // stop touch/click functions
          $deviceElement.addEventListener('touchend', function() {
            deviceStop($deviceElement)
          });
          $deviceElement.addEventListener('mouseup', function() {
            deviceStop($deviceElement)
          });
        }
      }

      var $nameElement = document.createElement('div');
      $nameElement.id = 'name:' + device.id
      $nameElement.classList.add('name');
      $nameElement.innerHTML = device.name;
      $deviceElement.appendChild($nameElement);
    });
  }

// New code start    
  function deviceStart($deviceElement, device, event) {
    if ( nameChange ) { return }
    longtouch = false;
    $deviceElement.classList.add('startTouch')
         
    timeout = setTimeout(function() {
      if ( $deviceElement.classList.contains('startTouch') ) {
        valueCycle(device);
      }
    }, 50)
  }

  function deviceStop($deviceElement) {
    timeout = setTimeout(function() {
      longtouch = false;
    },100)
    $deviceElement.classList.remove('startTouch')
  }
// New code end




    function renderText() {
      var now = new Date();
      var hours = now.getHours();

      var tod;
      if (hours >= 18) {
        tod = 'evening';
      } else if (hours >= 12) {
        tod = 'afternoon';
      } else if (hours >= 6) {
        tod = 'morning';
      } else {
        tod = 'night';
      }

      $textLarge.innerHTML = 'Good ' + tod + '!';
      $textSmall.innerHTML = 'Today is ' + moment(now).format('dddd[, the ]Do[ of ]MMMM YYYY[.]');
    }


function renderValue ($value, capabilityId, capabilityValue, capabilityUnits) {
    if ( capabilityUnits == null ) { capabilityUnits = "" }
    if ( capabilityUnits == "W/m^2" ) { capabilityUnits = "W/m²" }
    if ( capabilityValue == null ) { capabilityValue = "-" }
    if (capabilityId == "measure_temperature" ||
        capabilityId == "target_temperature" ||
        capabilityId == "measure_humidity"
        ) {
      capabilityValue = Math.round(capabilityValue*10)/10
      //var integer = Math.floor(capabilityValue)
      var integer = parseInt(capabilityValue)
      n = Math.abs(capabilityValue)
      var decimal = Math.round((n - Math.floor(n))*10)/10 + "-"
      var decimal = decimal.substring(2,3)

      $value.innerHTML = integer + "<span id='decimal'>" + decimal + capabilityUnits.substring(0,1) + "</span>"
    } else if ( capabilityId == "measure_pressure" ) {
      $value.innerHTML = Math.round(capabilityValue) + "<small style='font-size: 60%;'>" + capabilityUnits + "</small>"
    } else if ( capabilityId == "dim" || capabilityId == "volume_set") {
      $value.innerHTML = Math.round(capabilityValue*100) + "<small style='font-size: 60%;'>" + capabilityUnits + "</small>"
    } else {
      $value.innerHTML = capabilityValue + "<small style='font-size: 60%;'>" + capabilityUnits + "</small>"
    }
  }


function renderName(device, elementToShow) {
    nameElement = document.getElementById('name:' + device.id)
    deviceElement = document.getElementById('device:' + device.id)
    if ( !nameChange ) {
      currentName = nameElement.innerHTML;
    }
    nameChange=true;
    nameElement.classList.add('highlight')
    nameElement.innerHTML = elementToShow.title
    setTimeout( function(){
      nameChange = false;
      nameElement.innerHTML = currentName
      nameElement.classList.remove('highlight')
      deviceElement.classList.remove('push-long')
    }, 1000);
  }

function selectIcon($value, searchFor, device, capability) {
    // measure_uv and measure_solarradiation icons are broken at icons-cdn.athom.com
    if ( capability.iconObj && capability.id != "measure_uv" && capability.id != "measure_solarradiation" ) {
      iconToShow = 'https://icons-cdn.athom.com/' + capability.iconObj.id + '-128.png'
    } else {
      iconToShow = 'img/capabilities/' + capability.id + '.png'
    }
    if (device.name == "Bier") {iconToShow = 'img/capabilities/tap.png'}
    $icon = document.getElementById('icon:'+device.id);
    $iconcapability = document.getElementById('icon-capability:'+device.id);
    if ( $value.id == searchFor ) {
      $value.classList.add('visible')
      $icon.style.opacity = 1.0
      if (device.name == "Bier" || device.name == "Bier temperatuur") { $icon.style.opacity = 0.5}
      $iconcapability.style.webkitMaskImage = 'url(' + iconToShow + ')';
      $iconcapability.style.visibility = 'visible';
    } else {
      $value.classList.add('hidden')
    }
  }


  function showSecondary(device, event) {
    var showSlider = false
    var xpos
    try {
      //xpos = event.touches[0].clientX
      xpos = Math.round( 25 + ( parseInt((event.touches[0].clientX - 25)/(163*zoom) ) * (163*zoom) ) )
    }
    catch(err) {
      if ( theme == "web" ) { 
        xpos = event.clientX - event.offsetX
      } else {
        xpos = Math.round( 25 + ( parseInt((event.clientX - 25)/(163*zoom) ) * (163*zoom) ) )
      }
      /*
      console.log( event.clientX - event.offsetX )
      console.log( event.clientX )
      console.log( zoom )
      console.log( (event.clientX-25)/163/zoom )
      console.log( parseInt((event.clientX-25)/(163*zoom)) )
      console.log( Math.round( 25 + ( parseInt((event.clientX-25)/(163*zoom) ) * (163*zoom) ) ) )
      */
    }

    var newX = xpos + (150*zoom) + 5
    if ( newX + window.innerWidth* 0.35 > window.innerWidth ) {
      var newX = (xpos - (0.35 * window.innerWidth)) - 13
    }

    $sliderpanel.style.left = newX  + "px"
    $slidericon.style.webkitMaskImage = 'url(https://icons-cdn.athom.com/' + device.iconObj.id + '-128.png)';
    $slidername.innerHTML = device.name

    if ( device.capabilitiesObj && device.capabilitiesObj.dim || device.capabilitiesObj && device.capabilitiesObj.volume_set ) {
      $slider.min = 0
      $slider.max = 100
      $slider.step = 1
      sliderUnit = " %"
      if ( device.capabilitiesObj.dim ) {
        $slidercapability.style.webkitMaskImage = 'url(img/capabilities/dim.png)';
        $slider.value = device.capabilitiesObj.dim.value*100
      } else if ( device.capabilitiesObj.volume_set ) {
        $slidercapability.style.webkitMaskImage = 'url(img/capabilities/volume_set.png)';
        $slider.value = device.capabilitiesObj.volume_set.value*100
      }
      $slidervalue.innerHTML = $slider.value + sliderUnit
      showSlider = true
    } else if ( device.capabilitiesObj && device.capabilitiesObj.target_temperature ) {
      $slider.min = device.capabilitiesObj.target_temperature.min
      $slider.max = device.capabilitiesObj.target_temperature.max
      $slider.step = device.capabilitiesObj.target_temperature.step
      $slidercapability.style.webkitMaskImage = 'url(img/capabilities/target_temperature.png)';
      sliderUnit = "°"
      $slider.value = device.capabilitiesObj.target_temperature.value
      $slidervalue.innerHTML = $slider.value + sliderUnit
      showSlider = true
    }
    if ( showSlider ) {
      $sliderpanel.style.display = "block"
      selectedDevice = device
    }
  }

  function hideSecondary() {
    $sliderpanel.style.display = "none"

  }

  $slider.oninput = function() {
    $slidervalue.innerHTML = $slider.value + sliderUnit
    if ( slideDebounce ) {return}
    slideDebounce = true
    var newCapabilityValue
    var newCapabilityId
    setTimeout( function () {
      if ( selectedDevice.capabilitiesObj && selectedDevice.capabilitiesObj.dim ) {
        newCapabilityId = 'dim'
        newCapabilityValue = ($slider.value/100)
      } else if ( selectedDevice.capabilitiesObj && selectedDevice.capabilitiesObj.volume_set ) {
        newCapabilityId = 'volume_set'
        newCapabilityValue = ($slider.value/100)
      } else if ( selectedDevice.capabilitiesObj && selectedDevice.capabilitiesObj.target_temperature ) {
        newCapabilityId = 'target_temperature'
        newCapabilityValue = ($slider.value/1)
      }
      //console.log(newCapabilityId)
      homey.devices.setCapabilityValue({
        deviceId: selectedDevice.id,
        capabilityId: newCapabilityId,
        value: newCapabilityValue,
      }).catch(console.error);
      slideDebounce = false
    },200)
    
  }

  function valueCycle(device) {
    var itemMax = 0
    var itemNr = 0
    var showElement = 0
    for ( item in device.capabilitiesObj ) {
      capability = device.capabilitiesObj[item]
      if ( capability.type == "number") {
        itemMax = itemMax + 1
      }
    }
    for ( item in device.capabilitiesObj ) {
      capability = device.capabilitiesObj[item]
      if ( capability.type == "number" ) {
        if (
            capability.id == "light_temperature" ||
            capability.id == "light_saturation" ||
            capability.id == "light_hue"
            ) {
          continue;
        }
        searchElement = document.getElementById('value:' + device.id + ':' + capability.id)
        if ( itemNr == showElement ) {
          elementToShow = searchElement
          capabilityToShow = capability.id
          // measure_uv and measure_solarradiation icons are broken at icons-cdn.athom.com
          if ( capability.iconObj && capability.id != "measure_uv" && capability.id != "measure_solarradiation" ) {
          //if ( capability.iconObj ) {
            iconToShow = 'https://icons-cdn.athom.com/' + capability.iconObj.id + '-128.png'
            console.log(iconToShow)
          } else {
            iconToShow = 'img/capabilities/' + capability.id + '.png'
          }
          if (device.name == "Bier") {iconToShow = 'img/capabilities/tap.png'}
          itemNrVisible = itemNr
        }
        if ( searchElement.classList.contains('visible') ) {
          searchElement.classList.remove('visible')
          searchElement.classList.add('hidden')
          currentElement = itemNr
          showElement = itemNr + 1
        }
        itemNr = itemNr + 1
        if ( itemNr > itemMax - 1 ) {
          itemNr = 0;
        }
      }
    }
    $icon = document.getElementById('icon:'+device.id);
    $iconcapability = document.getElementById('icon-capability:'+device.id);
    if ( showElement != itemNr ) {
      elementToShow.classList.remove('hidden')
      elementToShow.classList.add('visible')
      renderName(device,elementToShow)
      setCookie(device.id,elementToShow.id,12)
      $icon.style.opacity = 1.0
      if (device.name == "Bier" || device.name == "Bier temperatuur") {$icon.style.opacity = .5}
      $iconcapability.style.webkitMaskImage = 'url(' + iconToShow + ')';
      $iconcapability.style.visibility = 'visible';
    } else {
      setCookie(device.id,"-",12)
      $icon.style.opacity = 1
      $iconcapability.style.visibility = 'hidden';
      deviceElement = document.getElementById('device:' + device.id)
      nameChange=true;
      setTimeout( function(){
        nameChange = false;
        deviceElement.classList.remove('push-long')
      }, 1000);
    }
  }




  } catch (err) {
    document.write('<pre>Error: ' + err.message + '\n' + err.stack);
  }
};

window.addEventListener('load', fillData);
