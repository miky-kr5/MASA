(function(){
    'use strict';

    angular
        .module('app.section')
        .controller('listarMatriculaCtrl', listarMatriculaCtrl)
        .controller('crearMatriculaCtrl', crearMatriculaCtrl)
        .controller('actualizarMatriculaCtrl', actualizarMatriculaCtrl)

    listarMatriculaCtrl.$inject = [ '$scope', '$rootScope', '$location', 'sections', '$modal', 'matriculaSeleccionada'];
    function listarMatriculaCtrl ( $scope, $rootScope, $location, sections, $modal, matriculaSeleccionada ){
        
        var vm = this;
        vm.lista = true;
        $rootScope.actOk = false;
        $rootScope.loading = true;
        $rootScope.table = false;

        vm.submit = function() {
        }

        var matriculaArray = [];
        sections.query(
            function(successResult){
                vm.matricula = successResult;
                angular.forEach(vm.matricula, function (value){
                    matriculaArray.push({
                        section:value.section,
                        code:value.code,
                        course:value.course,
                        semester:value.semester,
                        student: value.student
                    });
                });
                $rootScope.loading = false;
                $rootScope.table = true;
                vm.listaMatricula = matriculaArray;
            },
            function(data){
                console.log("Error al obtener los datos.");

            });

        /**************************Eliminar Matricula**************************/
        /* En este proceso, primero se llama a un Modal el cual se cerciora que
        el usuario se asegure de eliminar la matricula escogida, el usuario al 
        confirmar su decision llama automaticamente a la funcion que hara la 
        llamada a servicio que borrara la matricula de la base de datos.
        */
        vm.eliminarMatriculaModal = function (index) {
            
            $rootScope.index = index;   
            $rootScope.botonOk = true;
            $rootScope.otroBotonOk = false;
            $rootScope.botonCancelar = true;
            $rootScope.rsplice = false;
            $rootScope.eliminarLoading = false;
            $rootScope.mensaje = "¿Seguro que desea eliminar la matricula?";
            
            $scope.modalInstance = $modal.open({
                animation: $rootScope.animationsEnabled,
                templateUrl: 'partials/section/modal/delete_section_modal.html',
                scope: $scope,
                size: 'sm',
                resolve: {
                    items: function () {
                        return "";
                    }
                }
            });
        };

        vm.eliminarMatricula= function (index) {
            $rootScope.botonOk = false;
            $rootScope.otroBotonOk = true;
            $rootScope.botonCancelar = false;
            $rootScope.urlLo = 'listarMatricula';
            $rootScope.eliminarLoading = true;
            var name = vm.matricula[index].Nombre;

            sections.delete({ id: vm.matricula[index]._id }, 
                function (successResult) {
                    $rootScope.eliminarLoading = false;
                    $rootScope.rsplice = true;
                    $rootScope.mensaje = "Sección " + name + " eliminada.";
                },
                function (errorResult) {
                    $rootScope.eliminarLoading = false;
                    $rootScope.mensaje = "Error al eliminar la sección " + name; 
                    console.log('Could not delete from server');
                });
        };

        vm.eliminarMatriculaSplice = function (index, rsplice) {
            if(rsplice){
                vm.listaMatricula.splice(index, 1);
                $rootScope.rsplice = false;
            }
        };

        /*************************Fin de Eliminar Matricula********************/


        vm.modificarMatricula = function (index) {
            matriculaSeleccionada.Nombre = vm.matricula[index].Nombre;
            matriculaSeleccionada.Codigo = vm.matricula[index].Codigo;
            matriculaSeleccionada.Materia = vm.matricula[index].Materia; 
            matriculaSeleccionada.Semestre = vm.matricula[index].Semestre;
            matriculaSeleccionada.Estudiantes= vm.matricula[index].Estudiantes;
            $location.url('actualizarMatricula');
        };

        $rootScope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $rootScope.opened = true;
        };

        $scope.ok = function (urlLo) {
            $location.url(urlLo);
            $scope.modalInstance.dismiss('cancel');
        };
       
        $scope.cancel = function () {
            $scope.modalInstance.dismiss('cancel');
        };      

        return vm;
    };

    crearMatriculaCtrl.$inject = 
    ['$scope','$rootScope', '$location', 'sections', '$modal', 'courses'];
    function crearMatriculaCtrl($scope, $rootScope, $location, sections, $modal, courses){
        
        var vm = this;
        vm.submitted = false;
        $rootScope.mensaje = "";

        courses.query(
            function (successResult) {
                vm.materias = successResult;
            },
            function () {
                vm.materias = null;
            }); 

        vm.submit = function() {

            if (vm.data_input_form.$valid){
                vm.section = {

                    "section": vm.matricula.Nombre,
                    "code": vm.valorMateria.Codigo,
                    "course": vm.valorMateria.Nombre,
                    "semester": vm.matricula.Semestre,
                    "students": vm.matricula.Estudiantes,
                };

                $scope.modalInstance = $modal.open({
                    animation: $rootScope.animationsEnabled,
                    templateUrl: 'partials/section/modal/create_section_modal.html',
                    scope: $scope,
                    size: 'sm',
                    resolve: {
                        items: function () {
                            return $rootScope.items;
                        }
                    }
                });

                sections.save(vm.section,
                    function(){
                        $rootScope.botonOk = true;
                        $rootScope.urlLo = 'listarMatricula';
                        $rootScope.mensaje = "Sección " + vm.matricula.Nombre + " creada";
                    },
                    function(){
                        $rootScope.botonOk = true;
                        $rootScope.urlLo = 'listarMatricula';
                        $rootScope.mensaje = "Error creando la seccion " + vm.matricula.Nombre;
                    });
            }else{
                vm.submitted = true;
            }
        };

        vm.cargarEstudiantes = function () {

        };

        $scope.ok = function (urlLo) {
            $location.url(urlLo);
            $scope.modalInstance.dismiss('cancel');
        };

        $rootScope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $rootScope.opened = true;
        };

        return vm;
    };

    actualizarMatriculaCtrl.$inject = ['$scope', '$rootScope', '$location', 'sections', '$modal', 'matriculaSeleccionada'];
    function actualizarMatriculaCtrl($scope, $rootScope, $location, sections, $modal, matriculaSeleccionada){
        
        var vm = this;
        vm.lista = true;
        $rootScope.loading = true;
        $rootScope.table = false;
        vm.matricula = matriculaSeleccionada;
        vm.listaEstudiantes = vm.matricula.Estudiantes;


        vm.actualizarMatricula = function() {
            sections.update(section,
                function(){
                    $rootScope.botonOk = true;
                    $rootScope.botonCancelar = false;
                    $rootScope.urlLo = 'listarMatricula';
                    $rootScope.mensaje = "Sección actualizada";
                },
                function(){
                    $rootScope.botonOk = true;
                    $rootScope.botonCancelar = false;
                    $rootScope.urlLo = 'listarMatricula';
                    $rootScope.mensaje = "Error al actualizar la Sección ";
                });
        }

        vm.retirarEstudianteModal = function (index) {
            $rootScope.index = index;
            
            $rootScope.botonOk = true;
            $rootScope.otroBotonOk = false;
            $rootScope.botonCancelar = true;

            $rootScope.rsplice = false;
            $rootScope.eliminarLoading = false;
            $rootScope.mensaje = "¿Desea retirar este estudiante de la Sección?";

            $scope.modalInstance = $modal.open({
                animation: $rootScope.animationsEnabled,
                templateUrl: 'partials/section/modal/update_section_modal.html',
                scope: $scope,
                size: 'sm',
                resolve: {
                    items: function () {
                        return "";
                    }
                }
            });
        };

        vm.retirarEstudiante = function (index) {
            $rootScope.botonOk = false;
            $rootScope.otroBotonOk = true;
            $rootScope.botonCancelar = false;
            $rootScope.urlLo = 'actualizarMatricula';
        };

        vm.retirarEstudianteSplice = function(index, rsplice) {
            if(rsplice){
                vm.listaEstudiantes.splice(index, 1);
                $rootScope.rsplice = false;

                var section = {
                    'section': vm.matricula.Nombre,
                    'code': vm.matricula.Codigo,
                    'course': vm.matricula.Seccion,
                    'semester': vm.matricula.Semestre,
                    'students': vm.listaEstudiantes
                };
            }
        };

        $rootScope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $rootScope.opened = true;
        };

        $scope.ok = function (urlLo) {
            $location.url(urlLo);
            $scope.modalInstance.dismiss('cancel');
        };
       
        $scope.cancel = function () {
             $scope.modalInstance.dismiss('cancel');
        };      

        return vm;
    };

})();