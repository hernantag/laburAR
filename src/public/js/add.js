



$('.rubro').change(function () { 
    
let clase = $('.rubro :selected').val()
console.log(clase, 'es el rubro')

console.log($('.subrubro option:last').val())
$('.subrubro option:first').attr("selected")

$('.subrubro option').each(function (index) {

    if($(this).hasClass(clase)){
        $(this).show()
        $(this).removeAttr('hidden');
    }else
    {
        $(this).hide()
    }
});


   

    

});

/*  */