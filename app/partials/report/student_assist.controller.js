(function(){
    'use strict';

    angular
        .module('app.reports')
        .controller('StudentAssistCtrl', StudentAssistCtrl)

    StudentAssistCtrl.$inject = 
    ['$scope', '$state', 'professors', '$modal', 'selectedCourse', 'selectedSection', 'selectedStudent', 'authentication'];
    function StudentAssistCtrl($scope, $state, professors, $modal, selectedCourse, selectedSection, selectedStudent, authentication) {
        var vm = this;
        var user = authentication.currentUser();
        var professorid = user._id;
        vm.section = [];
        vm.lectures = 0;
        vm.percentage = 0;
        vm.positive = 0;
        vm.professor = null;
        vm.negative = 0;

        professors.get({ id: professorid },
            function (successResult){
                vm.professor = successResult;
                angular.forEach (vm.professor.courses[selectedCourse.index].sections[selectedSection.index].students, 
                    function (value, key){
                        if (value._id == selectedStudent._id ) {
                            selectedStudent.index = key;
                            vm.assistances = value.assistanceTotal;
                            vm.student = value; 
                            vm.lectures = value.assistance;
                        }   
                    });

                angular.forEach (vm.assistances,
                    function (value){
                        if (value.assistance) {
                            vm.positive++;
                        } else {
                            vm.negative++;
                        }
                });
                vm.total = vm.positive + vm.negative;
                vm.percentage = (vm.positive/vm.total)*100; 
            },
            function (){
                console.log("Error al obtener los datos.");
        });

        vm.back = function (index) {
            $state.go('studentReport');
        };
    };
})();