document.addEventListener('DOMContentLoaded', function(){
   document.getElementById("menu-button").addEventListener("click", function() {
       this.classList.toggle("active");
       document.getElementById("nav-selector").classList.toggle("active");
       document.getElementById("mask").classList.toggle("active");
   });
});