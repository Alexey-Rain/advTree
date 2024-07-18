import $ from "jquery";

$(function() {

    let Nodes = {};
    let fullNodes = {};
    let pids = [];
    let new_id='';
    let new_name='';
    let selectedNode='';
    let prevSelectedNode=null;
    let prev_input_search = '';
    let list = null;
    let flatlist = null;
    let fulllist = null;
    let fullflatlist = null;
    let countCheck=0;
    let sizeList=0;

    function GeneratorId(){
        let next_id = 0;
        for (let id in Nodes){
            if (next_id <= Number(id)){
                next_id = Number(id)+1
            }
        }
        return next_id.toString()
    }
    function getChild(list){
        for (let id in list) {
            pids.forEach(function (pid){
                Nodes[pid]['childs'].push(id)
            })
            if (list[id]['child']){
                pids.push(id);
                getChild(list[id]['child']);
                pids.pop();
            }
        }
    }
    function getFullChild(list){
        for (let id in list) {
            pids.forEach(function (pid){
                fullNodes[pid]['childs'].push(id)
            })
            if (list[id]['child']){
                pids.push(id);
                getFullChild(list[id]['child']);
                pids.pop();
            }
        }
    }
    function updateArrays() { // Формирование списка с массивами child и parent

        Nodes = {};
        fullNodes = {}
        prev_input_search = $('#input-search')[0].value;
        list = JSON.parse($('#twig-data')[0].dataset.list);
        flatlist = JSON.parse($('#twig-data')[0].dataset.flatlist);
        fulllist = JSON.parse($('#twig-data')[0].dataset.fulllist);
        fullflatlist = JSON.parse($('#twig-data')[0].dataset.fullflatlist);

        for (let id in fullflatlist) {
            fullNodes[id] = {'name': fullflatlist[id]['name'], 'pid': fullflatlist[id]['pid'], 'status': fullflatlist[id]['status'], 'parents': [], 'childs': []};
        }
        for (let id in fulllist) {
            if (fulllist[id]['child']){
                pids = []
                pids.push(id)
                getFullChild(fulllist[id]['child']);
                pids.pop()
            }
        }
        for (let pid in fullNodes) {
            //console.log(id, 'node: ', Nodes[pid]);
            for (let id in fullNodes) {
                if (fullNodes[pid]['childs'].includes(id)) {
                    fullNodes[id]['parents'].push(pid);
                }
            }
        }

        for (let id in flatlist) {
            Nodes[id] = {'name': flatlist[id]['name'], 'pid': flatlist[id]['pid'], 'status': flatlist[id]['status'], 'parents': [], 'childs': []};
        }
        for (let id in list) {
            if (list[id]['child']){
                pids = []
                pids.push(id)
                getChild(list[id]['child']);
                pids.pop()
            }
        }
        for (let pid in Nodes) {
            //console.log(id, 'node: ', Nodes[pid]);
            for (let id in Nodes) {
                if (Nodes[pid]['childs'].includes(id)) {
                    Nodes[id]['parents'].push(pid);
                }
            }
        }

        //console.log('fullNodes: ', fullNodes);
    }
    function CheckUpdateTwid(countMax=1) {
        $('#btn-twig-data').trigger('click');
        countCheck++;
        sizeList = fullNodes.length;
        if(countCheck <= countMax){
            updateArrays();
            if (sizeList === fullNodes.length){
                window.setTimeout(updateArrays, 1000);
            }
            else{
                countCheck = 0;
                }
        }else{countCheck = 0;}
    }

    CheckUpdateTwid(1);

    document.addEventListener('click', function(event) {
        //console.log('click: className: "'+event.target.className+'"; id: "'+event.target.id+'"'+ 'tagName: "'+ event.target.tagName+'"');
        try {
            if (event.target.id === 'modal_btn_deleteall') {
                let arr_id = Nodes[selectedNode]['childs'];
                arr_id.push(selectedNode);
                $('#btn_action').attr({
                    "data-live-action-param": 'deleteNode',
                    "data-live-arrid-param": JSON.stringify(arr_id),
                });
                prevSelectedNode = null
                selectedNode = null
                $('#btn_action').trigger('click');
                CheckUpdateTwid(3);

            }
            else if (event.target.id === 'modal_btn_delete' || event.target.id === 'modal_btn_delete-one-node') {
                $('#btn_action').attr({
                    "data-live-action-param": 'deleteNode',
                    "data-live-arrid-param": JSON.stringify([selectedNode]),
                });
                prevSelectedNode = null
                selectedNode = null
                $('#btn_action').trigger('click');
                CheckUpdateTwid(3);
            }
            else if (event.target.id === 'modal_btn_new_node') {
                $('#modal_frm_new_node #input-name-validate').trigger('click');
            }
            else if (event.target.id === 'modal_btn_new_subnode') {
                $('#modal_frm_new_subnode #input-name-validate').trigger('click');
            }
            else if (event.target.id.includes('img-btn_add')) {
                //console.log("img-btn-node getAttribute: ", this.getAttributeNames().reduce((acc, name) => {return {...acc, [name]: this.getAttribute(name)};}, {}));
                new_id =GeneratorId();
                $('#modal_frm_new_subnode #label-id').text('ID: ' + new_id);
                $('#modal_frm_new_subnode #label-pid').text('Категория: "' + Nodes[selectedNode]['name']+'"');
                $('#input-name-new-subnode')[0].value = '';
                $('#modal_btn_new_subnode').prop("disabled", true);

                $('#modal-dialog-del-one-node')[0].style.display = 'none';
                $('#modal-dialog-del-nodes')[0].style.display = 'none';
                $('#modal-dialog-add-new-node')[0].style.display = 'none';
                $('#modal-dialog-add-new-subnode')[0].style.display = 'block';
                $('#btn_show_modal').trigger('click');
            }
            else if(event.target.id.includes('img-btn-del-node')){
                if (Nodes[selectedNode]['childs'].length > 0) {
                    $('#modal-dialog-del-nodes-name').text('Элемент id: ' + selectedNode + '  name: "' + Nodes[selectedNode]['name'] + '" будет удалён !!!');
                    $('#modal-dialog-add-new-node')[0].style.display = 'none';
                    $('#modal-dialog-del-one-node')[0].style.display = 'none';
                    $('#modal-dialog-add-new-subnode')[0].style.display = 'none';
                    $('#modal-dialog-del-nodes')[0].style.display = 'block';
                    $('#btn_show_modal').trigger('click');
                }
                else {
                    $('#modal-dialog-del-one-node-name').text('Элемент id: ' + selectedNode + '  name: "' + Nodes[selectedNode]['name'] + '" будет удалён !!!');
                    $('#modal-dialog-del-nodes')[0].style.display = 'none';
                    $('#modal-dialog-add-new-node')[0].style.display = 'none';
                    $('#modal-dialog-add-new-subnode')[0].style.display = 'none';
                    $('#modal-dialog-del-one-node')[0].style.display = 'block';
                    $('#btn_show_modal').trigger('click');
                }
            }
            else if (event.target.className === 'form-control-box-edit-node') {
                if (selectedNode != event.target.dataset.elid){
                    if(selectedNode){
                        $('#'+'node-box-'+selectedNode)[0].className = 'node-box'
                    }
                    selectedNode = event.target.dataset.elid;
                }
            }
            else if (event.target.className === 'img-btn-edit') {
                $('#node-box-' + event.target.dataset.elid).trigger('click');
                $('#img-btn_folder_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn_add-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#img-btn_edit-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#img-btn-del-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#node-box-' + event.target.dataset.elid)[0].style.display = 'none';
                $('#box_edit-node_' + event.target.dataset.elid)[0].value = $('#node-box-' + event.target.dataset.elid).text();
                $('#box_edit-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#box_edit-node_' + event.target.dataset.elid)[0].focus();
            }
            else if (event.target.className === 'node-box') {
                if (selectedNode !== event.target.dataset.elid){
                    if(selectedNode){
                        $('#node-box-'+selectedNode)[0].className = 'node-box'
                    }

                    if (prevSelectedNode){
                        if (prevSelectedNode !== event.target){
                            prevSelectedNode.className='node-box'
                            $('#' + 'img-btn_folder_' + selectedNode)[0].style.display = 'inline-block';
                            $('#' + 'img-btn_add-node_' + selectedNode)[0].style.display = 'none';
                            $('#' + 'img-btn_edit-node_' + selectedNode)[0].style.display = 'none';
                            $('#' + 'img-btn-del-node_' + selectedNode)[0].style.display = 'none';
                        }
                    }

                    prevSelectedNode = event.target
                    selectedNode = event.target.dataset.elid
                    event.target.className='node-box-selected'
                    $('#' + 'img-btn_folder_' + selectedNode)[0].style.display = 'none';
                    $('#' + 'img-btn_add-node_' + selectedNode)[0].style.display = 'inline-block';
                    $('#' + 'img-btn_edit-node_' + selectedNode)[0].style.display = 'inline-block';
                    $('#' + 'img-btn-del-node_' + selectedNode)[0].style.display = 'inline-block';
                }
            }
            else if (event.target.className === 'node-img-btn collapsed') {
                event.target.style.transform = "rotate(0deg)";
            }
            else if (event.target.className === 'node-img-btn') {
                event.target.style.transform = "rotate(90deg)";
            }
            else if (event.target.id === 'import-xml-img-btn') {
                $('#filedialog').trigger('click');
            }
            else if (event.target.id === 'tree-add-el-inroot-img-btn') {
                new_id =GeneratorId();
                $('#modal_frm_new_node #label-id').text('ID: ' + new_id);
                $('#input-name-new-node')[0].value = '';
                $('#modal_btn_new_node').prop("disabled", true);
                $('#modal-dialog-del-one-node')[0].style.display = 'none';
                $('#modal-dialog-del-nodes')[0].style.display = 'none';
                $('#modal-dialog-add-new-subnode')[0].style.display = 'none';
                $('#modal-dialog-add-new-node')[0].style.display = 'block';
                $('#btn_show_modal').trigger('click');
            }
            else if (event.target.id === 'tree-expand-collapse-img-btn') {
                if (event.target.className == 'tree-expand-collapse-img-btn-collapse'){
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
            }
            else if (event.target.id === 'btn-clear-search') {
                if ($('#input-search')[0].value) {
                    $('#input-search')[0].value = "";
                    $('#input-search')[0].dispatchEvent(new Event('change', {bubbles: true}));
                    $('#btn-clear-search')[0].style.visibility = 'hidden';
                }
            }

        } catch (err) {
            CheckUpdateTwid(1);
            console.log('err: ', err);
        }
    });
    document.addEventListener('dblclick', function(event) {
        try {
            if (event.target.className === 'node-box-selected') {
                $('#node-box-' + event.target.dataset.elid).trigger('click');
                $('#img-btn_folder_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn_add-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#img-btn_edit-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#img-btn-del-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#node-box-' + event.target.dataset.elid)[0].style.display = 'none';
                $('#box_edit-node_' + event.target.dataset.elid)[0].value = $('#node-box-' + event.target.dataset.elid).text();
                $('#box_edit-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#box_edit-node_' + event.target.dataset.elid)[0].focus();
            }
        } catch (err) {
            CheckUpdateTwid(1);
            console.log('err: ', err);
        }
    });
    document.addEventListener('keyup', function(event) {
        try {
            if (event.target.tagName === 'INPUT') {
            if (event.target.id!='input-search') {
                if (event.target.checkValidity() == true) {
                    $(event.target).css('color', 'green')
                } else {
                    $(event.target).css('color', 'red')
                }
            }
        }
            if (event.target.id === 'input-search') {
                if (prev_input_search !== event.target.value) {
                    prev_input_search = event.target.value
                    if (!event.target.value) {
                        $('#btn-clear-search')[0].style.visibility = 'hidden';
                    } else {
                        $('#btn-clear-search')[0].style.visibility = 'visible';
                    }
                }
            }
            if (event.target.id === 'input-name-new-node') {
                if ($('#input-name-new-node')[0].value.trim()===''){
                    $('#modal_btn_new_node').prop("disabled", true);
                }
                else {
                    $('#modal_btn_new_node').prop("disabled", false);
                }
            }
            else if (event.target.className === 'form-control-box-edit-node') {
                if (event.key === 'Escape'){
                    event.target.blur();
                }
            }
            else if (event.target.id === 'input-name-new-subnode') {
            if ($('#input-name-new-subnode')[0].value.trim()===''){
                $('#modal_btn_new_subnode').prop("disabled", true);
            }
            else {
                $('#modal_btn_new_subnode').prop("disabled", false);
            }
        }
        } catch (err) {
            CheckUpdateTwid(1);
            console.log('err: ', err);
        }    });
    document.addEventListener('focusout', function(event) {
        try {
            if (event.target.className === 'form-control-box-edit-node'){
                $('#box_edit-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#node-box-' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn_folder_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#img-btn_add-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn_edit-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn-del-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
            }
            if (event.target.tagName === 'INPUT') {
                $(event.target).css('color', 'black')
            }
        } catch (err) {
            CheckUpdateTwid(1);
            console.log('err: ', err);
        }
    });
    document.addEventListener('change', function(event) {
        try {
            if (event.target.id === 'filedialog'){
            $('#btn_action').attr({"data-live-action-param": 'files(xml_file)|importXML'});
            $('#btn_action').trigger('click');
            $('#btn-clear-search').trigger('click');
            //window.setTimeout('location.reload()', 1000);
        }
        } catch (err) {
            CheckUpdateTwid(1);
            console.log('err: ', err);
        }
    });
    document.addEventListener('submit', function(event) {
        try {
            if (event.target.id === 'modal_frm_new_node'){
                new_name = $('#input-name-new-node')[0].value.trimStart().trimEnd();
                $('#btn_action').attr({
                    "data-live-action-param": 'addNewNode',
                    "data-live-id-param": new_id,
                    "data-live-name-param": new_name,
                    "data-live-pid-param": '0',
                    "data-live-status-param": 'selected',
                });
                $('#btn_action').trigger('click');
                CheckUpdateTwid(3);
                //window.setTimeout('location.reload()', 1000);
            }
            else if (event.target.id === 'modal_frm_new_subnode'){
                new_name = $('#input-name-new-subnode')[0].value.trimStart().trimEnd();
                $('#btn_action').attr({
                    "data-live-action-param": 'addNewNode',
                    "data-live-id-param": new_id,
                    "data-live-name-param": new_name,
                    "data-live-pid-param": selectedNode,
                    "data-live-status-param": 'selected',
                });
                $('#btn_action').trigger('click');
                CheckUpdateTwid(3);
                //window.setTimeout('location.reload()', 1000);
            }
            else if (event.target.className === 'accordion-header'){
            event.preventDefault();
            if ($('#box_edit-node_' + event.target.dataset.elid)[0].checkValidity() == true){
                new_name = $('#box_edit-node_' + event.target.dataset.elid)[0].value.trimStart().trimEnd();
                $('#node-box-' + event.target.dataset.elid).text(new_name);
                Nodes[event.target.dataset.elid]['name'] = new_name;
                Nodes[event.target.dataset.elid]['status'] = 'selected';
                $('#btn_action').attr({
                    "data-live-action-param": 'updateNode',
                    "data-live-id-param": event.target.dataset.elid,
                    "data-live-name-param": Nodes[event.target.dataset.elid]['name'],
                    "data-live-pid-param": Nodes[event.target.dataset.elid]['pid'],
                    "data-live-status-param": Nodes[event.target.dataset.elid]['status'],
                });
                $('#btn_action').trigger('click');
                CheckUpdateTwid(3);
                //window.setTimeout('location.reload()', 1000);
                $('#box_edit-node_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#node-box-' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn_folder_' + event.target.dataset.elid)[0].style.display = 'none';
                $('#img-btn_add-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn_edit-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#img-btn-del-node_' + event.target.dataset.elid)[0].style.display = 'inline-block';
                $('#node-box-' + event.target.dataset.elid).trigger('click');
            }
        }
        } catch (err) {
            CheckUpdateTwid(1);
            console.log('err: ', err);
        }
    });

/*
    $('.tree-node-row').hover(function (){
        if(selectedNode) {
            if(selectedNode==this.dataset.elid && !['new', 'edit'].includes(Nodes[this.dataset.elid]['status'])){
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
*/

    prevSelectedNode = null;
    selectedNode = '';
    for (let id in Nodes) {
        if (Nodes[id]['status'] === "selected"){
            $('#node-box-'+id).trigger('click');
            $('#img-btn_folder_' + id)[0].style.display = 'none';
            $('#img-btn_add-node_' + id)[0].style.display = 'inline-block';
            $('#img-btn_edit-node_' + id)[0].style.display = 'inline-block';
            $('#img-btn-del-node_' + id)[0].style.display = 'inline-block';

        }
    }
});
