var app = angular.module("app", ["ui.ace"])
var l;
// wrapping assert
app.factory("assert", function () {
  window.assert = chai.assert;
  return chai.assert ;
});
app.factory("env", function () {
  return {
    code: 'function main(){ return 3; } \n\nfunction getExtension(filename){\n\tvar parts = filename.split(".");\n\tif (parts.length > 1)\n\t\treturn parts[1]; \n\telse \n\t\treturn "";\n }',
    toString: function(){return JSON.stringify(this)}
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
    updateObject: function(scope, obj, objkey){
      scope.$watch(objkey, function (newValue) {
        localStorage.setItem(objkey, newValue);
      }, true)
    },
    retrieveObject: function(obj, key, objkey){
      var v = localStorage.getItem(objkey);
      if (v != null){
        obj[key] = v;
      }
    }

  }
})

app.controller("tester", function ($scope, assert, Test, Storage, env) {



  //Storage.retrieveEnv($scope.env, "code");
  //Storage.updateEnv($scope, env, "code")
  Storage.retrieve($scope, "testSuite");
  //Storage.retrieveObject(env, "code", "env.code");
  Storage.updateObject($scope, env, "env.code");
  //$scope.$watchCollection("testSuite", function(newValue){
     //localStorage.setItem("testSuite", newValue);
  //});

  // test suite
  $scope.env = env; l= env;
  $scope.testSuite = [];
  
  $scope.addTest = function (text, opened) {
    var num = $scope.testSuite.length
    var test = new Test(text, num, $scope.code);
    opened = opened || false;
    test.isOpened = opened;
    $scope.testSuite[num] = test;
    $scope.newTest = ""
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
  $scope.addTest("assert.equal(main(), 3)")
  $scope.addTest("assert.equal(getExtension('f.mp4'), 'mp4')")
  $scope.addTest("x = 3")

})
