var app = angular.module("app", ["ui.ace"])
// wrapping assert
app.factory("assert", function () {
  window.assert = chai.assert;
  return chai.assert ;
});
app.factory("env", function () {
  return {
    code: 'function main(){ return 3; } \n\nfunction getExtension(filename){\n\tvar parts = filename.split(".");\n\tif (parts.length > 1)\n\t\treturn parts[1]; \n\telse \n\t\treturn "";\n }',
    getTests: function () {      
      var testKeys = Object.keys(this)
                        .filter(function(k){
                          return k.indexOf("test_") === 0
                        });
      return testKeys.map(function(k){ return this[k] });
    },
    tests: [ ]
  }
});


// a Test 
app.factory("Test", function (assert, env) {
  return function(text, num){    
    var STATES = {NOTLAUNCHED: "", SUCCEEDED: "succeeded", FAILED: "failed"}
    this.state = STATES.NOTLAUNCHED; 
    this.isOpened = false;
    this.isDisabled = false;

    this.num = num;
    this.text = text;
    this.launch = function () {
      console.group("running test", this.num)
      try {
        eval.call(window, env.code);
        eval.call(window, this.text);
        console.info("success")
        this.state = STATES.SUCCEEDED
      } catch(e) {
        console.error(e.message)
        this.state = STATES.FAILED;
      }
      console.groupEnd();
    };
    this.toString = function(){return JSON.stringify(this)}
    this.hasSucceeded = function() {
      return this.state === STATES.SUCCEEDED;
    }
    this.hasFailed= function () {
      return this.state === STATES.FAILED;
    };
    this.name = "test_" + this.num;
  }
});

app.factory("Storage", function () {
  return {
    retrieve: function (scope, key) {
      var v = localStorage.getItem(key);
      if (v != null){
        scope[key] = v;
      }
    },
    update: function(scope, key) {
      scope.$watch(key, function (newValue) {
        localStorage.setItem(key, newValue);
      }, true)
    },
    updateObject: function(scope, objkey, key){
      scope.$watch(objkey, function (newValue) {
        localStorage.setItem(key, newValue);
      }, true)
    },

    updateEnvKey: function(scope, env, key){
      var name = "env." + key
      scope.$watch(name, function (newValue) {
        localStorage.setItem(key, newValue);
      }, true);
    },
    retrieveEnvKey: function(scope, env, key){
      var v = localStorage.getItem(key);
      if (v != null){
        env[key] = v;
      }
    },
    retrieveObject: function(obj, key){
      var v = localStorage.getItem(key);
      if (v != null){
        obj[key] = v;
      }
    }

  }
})

app.controller("tester", function ($scope, assert, Test, Storage, env) {




  // test suite
  $scope.env = env;l=env;
  $scope.testSuite = env.tests;

  $scope.numberOfTests = 0;

  $scope.addTest = function (text, opened) {
    var num = $scope.numberOfTests++;
    var test = new Test(text, num, $scope.code);
    opened = opened || false;
    test.isOpened = opened;
    $scope.testSuite[test.num] = test
    $scope.newTest = ""
    $scope.$watch("testSuite["+ test.num +"]", function (newValue) {
      localStorage.setItem(test.name, newValue);
    }, true);
  };

  $scope.launch = function(){
    angular.forEach($scope.testSuite, function (t) {
      if (! t.isDisabled)
        t.launch();
    })
  }
  $scope.openAll = function(){
    angular.forEach($scope.testSuite, function (t) {
      if (! t.isOpened)
        t.isOpened = true;
    })
  }
  $scope.closeAll = function(){
    angular.forEach($scope.testSuite, function (t) {
      if (t.isOpened)
        t.isOpened = false;
    })
  }


  // fake
  //$scope.addTest("assert.equal(main(), 3)")
  //$scope.addTest("assert.equal(getExtension('f.mp4'), 'mp4')")
  //$scope.addTest("x = 3")


  // watchers
  //Storage.retrieveObject(env, "code", "code");
  Storage.retrieveEnvKey($scope, env, "code")
  Object.keys(localStorage)
    .filter(function (k) {
      return k.indexOf("test_") === 0
    })
    .forEach(function (k) {
      var v = localStorage.getItem(k);
      v = JSON.parse(v);
      if (v != null){
        $scope.addTest(v.text)
      }
    })
  //Storage.retrieveEnvKey($scope, env, "tests")
  //Storage.retrieveObject(env, "Object.keys(localStorage).filter()code", "env.testSuite");
  //Storage.updateObject($scope, env.code, "code");
  Storage.updateEnvKey($scope, env, "code")
  //Storage.updateEnvKey($scope, env, "tests")
  //Storage.updateObject($scope, env, "env.testSuite");
  //var testKeys = Object.keys(localStorage).filter(function(k){return k.indexOf("env.tests.") === 0});
  //testKeys.forEach(function (k) {
    //Storage.retrieveObject(env, k.slice(4), k);
  //})
  //Storage.retrieve($scope, "testSuite");
  //$scope.$watch("testSuite", function(newValue){
    //console.log("updating", newValue);
     //localStorage.setItem("testSuite", newValue);
  //}, true);
})
