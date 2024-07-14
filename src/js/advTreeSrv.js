import $ from "jquery";
//global.$ = global.jQuery = $;
//import 'jquery-ui';
$(function() {

    let input_search = $('#input-search');
    let btn_clear_search = $('#btn-clear-search');
    let prev_input_search = input_search[0].value;
    let selectedNode;

    // !!! For debug !!!
    /*
    let list = JSON.parse(input_search[0].dataset.list);
    console.log('list: ');
    console.log(list);
    input_search.on('change', function(){
        list = JSON.parse(input_search[0].dataset.list);
        console.log('list: ');
        console.log(list);
    });
    // !!! For debug !!!  */

    $('#filedialog').on('change', function(e){
        //console.log(e.target.files[0]);
        $('#filedialog').trigger('click');
        $('#send_file').trigger('click');
        // !!! For debug !!!  console.log('файл <' + e.target.files[0].name + '> отправлен');
    });
    $('#import-xml-img-btn').on('click', function(){ $('#filedialog').trigger('click');});
    $('.tree-node-row').hover(function (){
        if(selectedNode) {
            if(selectedNode==this.dataset.elid){
                $('#' + 'img-btn_folder_' + this.dataset.elid)[0].style.display = 'none';
                $('#' + 'img-btn_add-node_' + this.dataset.elid)[0].style.display = 'inline-block';
                $('#' + 'img-btn_edit-node_' + this.dataset.elid)[0].style.display = 'inline-block';
                $('#' + 'img-btn-del-node_' + this.dataset.elid)[0].style.display = 'inline-block';
            }
        }
    },
        function () {
            if (selectedNode) {
                if (selectedNode == this.dataset.elid) {
                    $('#' + 'img-btn_folder_' + this.dataset.elid)[0].style.display = 'inline-block';
                    $('#' + 'img-btn_add-node_' + this.dataset.elid)[0].style.display = 'none';
                    $('#' + 'img-btn_edit-node_' + this.dataset.elid)[0].style.display = 'none';
                    $('#' + 'img-btn-del-node_' + this.dataset.elid)[0].style.display = 'none';
                }
            }
        }
    );
    input_search.on('keyup', function(){
        if (prev_input_search !== this.value){
            prev_input_search = this.value
            if (!this.value){
                btn_clear_search[0].style.visibility = 'hidden';
            }
            else{
                btn_clear_search[0].style.visibility = 'visible';
            }

        }
    });
    btn_clear_search.on('click', function(){
        if (input_search[0].value){
            input_search[0].value = "";
            input_search[0].dispatchEvent(new Event('change', { bubbles: true }));
            btn_clear_search[0].style.visibility = 'hidden';
        }
    });
    $('#tree-expand-collapse-img-btn').on('click', function(e){
        if (e.target.className == 'tree-expand-collapse-img-btn-collapse'){
            $('#tree-expand-collapse-img-btn').toggleClass('tree-expand-collapse-img-btn-collapse tree-expand-collapse-img-btn');
            $('.node-img-btn').each(function (index, element) {
                //console.log($(element).attr('class'))
                if ($(element).attr('class').includes('collapsed')){
                    $(element).trigger('click')
                    document.getElementById(($(element).attr('id'))).style.transform = "rotate(90deg)";
                }
            });
        }
        else{
            $('#tree-expand-collapse-img-btn').toggleClass('tree-expand-collapse-img-btn tree-expand-collapse-img-btn-collapse');
            $('.node-img-btn').each(function (index, element) {
                //console.log($(element).attr('class'))
                if (!$(element).attr('class').includes('collapsed')){
                    $(element).trigger('click')
                    document.getElementById(($(element).attr('id'))).style.transform = "rotate(0deg)";
                }
            });
        }
    });
    $('.node-img-btn').on('click', function(e){
        if (e.target.className == 'node-img-btn'){
            document.getElementById(e.target.id).style.transform = "rotate(90deg)";
        }
        else{
            document.getElementById(e.target.id).style.transform = "rotate(0deg)";
        }
    });
    $('.node-box').on('click', function(e){
        if (selectedNode != e.target.dataset.elid){
            if(selectedNode){
                $('#'+'node-box-'+selectedNode)[0].className = 'node-box'
           }
            selectedNode = e.target.dataset.elid
            e.target.className='node-box-selected'
            $('#' + 'img-btn_folder_' + selectedNode)[0].style.display = 'none';
            $('#' + 'img-btn_add-node_' + selectedNode)[0].style.display = 'inline-block';
            $('#' + 'img-btn_edit-node_' + selectedNode)[0].style.display = 'inline-block';
            $('#' + 'img-btn-del-node_' + selectedNode)[0].style.display = 'inline-block';
        }
    });
    $('.node-box').on('dblclick', function(e){
        console.log("Изменить имя элемента: " + e.target.dataset.elid);
    });
    $('.img-btn-edit').on('click', function(e){
        console.log("Изменить имя элемента: " + e.target.dataset.elid);
    });

});

/* <script type="module"> // without jquery
        var input_search = document.querySelector('#input-search');
        var prev_input_search = input_search.value;
        input_search.addEventListener('keyup', function() {
            if (prev_input_search !== input_search.value){
            prev_input_search = input_search.value
            console.log("input_search: " + "< " + input_search.value + " >");
            if (!input_search.value){
            console.log("input_search set clear");
        }

        }
        });
        var btn_clear_search = document.querySelector('#btn-clear-search');
        btn_clear_search.addEventListener('click', function() {
            if (input_search.value){
            input_search.value = "";
            console.log("input_search set clear");
        }
        });
    </script>
*/
