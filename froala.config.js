$.extend($.FroalaEditor.POPUP_TEMPLATES, {
    "customPlugin.popup": '[_CUSTOM_LAYER_][_BUTTONS_]'
});
$.extend($.FroalaEditor.DEFAULTS, {
    popupButtons: ['OK']
});
$.FroalaEditor.PLUGINS.customPlugin = function (editor) {
    function initPopup () {
        //弹出按钮
        var popup_buttons = '';
        if (editor.opts.popupButtons.length > 0) {
            popup_buttons += '<div class="insertButton">';
            popup_buttons += editor.button.buildList(editor.opts.popupButtons);
            popup_buttons += '</div>';
        }
        // 加载弹出模板
        var template = {
            buttons: popup_buttons,
            custom_layer: '<div id="main_button">' +       
                            '<form id="uploadForm" action="/pc/api/upload/uploadImage.do" method="post" enctype="multipart/form-data">' +
                                  '<div class="upload_main">' +
                                      '<div class="upload_choose">' +
                                          '<label for="fileImage"><div class="webuploader-pick"><span class="uploadImg"></span><span class="pic_choose">选择图片</span></div></label>' +
                                          '<input id="fileImage" type="file" size="30" name="fileselect[]" multiple accept="image/gif, image/jpg, image/jpeg, image/png" />' +                           
                                      '</div>' +
                                      '<div id="preview" class="upload_preview"></div>' +
                                  '</div>' +
                                  '<div id="uploadInf" class="upload_inf"></div>' +
                                  '<div id="insertInf" class="insert_inf"></div>' +
                            '</form>' +            
                      '</div>'
        };
        // 加载弹出窗口
        var $popup = editor.popups.create('customPlugin.popup', template);
        return $popup;
    }
    // 显示弹出窗口
    function showPopup () {
        var $popup = editor.popups.get('customPlugin.popup');
        if (!$popup) $popup = initPopup();
        // Set the editor toolbar as the popup's container.
        editor.popups.setContainer('customPlugin.popup', editor.$tb);
        var $btn = editor.$tb.find('.fr-command[data-cmd="mulImages"]');
        // 设置弹窗位置
        var left = $btn.offset().left + $btn.outerWidth() / 2;
        var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);
        editor.popups.show('customPlugin.popup', left, top, $btn.outerHeight());
    }
    // 隐藏弹窗
    function hidePopup () {
        editor.popups.hide('customPlugin.popup');
    }
    return {
        showPopup: showPopup,
        hidePopup: hidePopup
    };
}
$.FroalaEditor.DefineIcon('buttonIcon', { NAME: 'image'});
$.FroalaEditor.RegisterCommand('mulImages', {
    title: 'insertImages',
    icon: 'buttonIcon',
    undo: false,
    focus: false,
    plugin: 'customPlugin',
    callback: function() {
        this.customPlugin.showPopup();
        var params = {
            fileInput: $("#fileImage").get(0),
            preView: $("#preview"),
            url: $("#uploadForm").attr("action"),
            filter: function(files) {
                var arrFiles = [];
                for (var i = 0; i<files.length; i++) {
                    if (files[i].type.indexOf("image") == 0) {
                        arrFiles.push(files[i]);      
                    } else {
                        alert('文件"' + files[i].name + '"不是图片。');  
                    }
                }
                return arrFiles;
            },
            onSelect: function(files) {
                $("#OK-1").show();
                $(".insertButton").removeClass("hide");
                $(".upload_add").show(); 
                $(".upload_choose").addClass("second"); 
                var i = 0;
                //删除
                this.preView.off();
                this.preView.on('click', ".upload_delete", function (e) { 
                    var index = $(this).parents('.upload_append_list').index();
                    FILE.funDeleteFile(index);    
                    var parent=this.parentNode;
                    parent.parentNode.remove();
                });
                //添加
                var funAppendImage = function() {
                    var file = files[i];
                    if (file) {
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function(e) {
                            $($("#addPic")).before('<div class="upload_append_list"><p>' + 
                            '<a href="javascript:" class="upload_delete" title="删除" ></a><br />' +
                            '<img src="' + e.target.result + '" class="upload_image" >'+
                            '<progress value="" max=""></progress></img></p>'+ 
                            '<span class="success"></span>'+
                            '</div>');
                            i++;
                            funAppendImage();                                   
                        }
                    } else {               
                        if ($("#preview").html()) {
                            $("#addPic").show();
                        }
                    }
                };
                funAppendImage();   
            }         
        };
        FILE = $.extend(FILE, params);
        FILE.init();
    }
});
$.FroalaEditor.RegisterCommand('OK', {
    title: 'insert',
    undo: false,
    focus: false,
    refreshAfterCallback: false,
    callback: function () {
        FILE.insertFile();
        this.html.insert($("#insertInf").html());
        this.customPlugin.hidePopup();
        $('#uploadForm')[0].reset();
        self.setState({ispublish: true});
    }
});

$('#edit').froalaEditor({
    height: 485,
    width: 933,
    zIndex: 2,
    language: 'zh_cn', // 语言 结合 languages/zh_cn.js
    charCounterCount: false,
    toolbarButtons: ['fullscreen','bold', 'italic', 'underline', 'fontFamily',
        'fontSize', 'color', 'align', 'formatOL', 'formatUL', 'emoticons', 'mulImages',
        'insertVideo', 'insertLink', 'insertTable', '|', 'undo', 'redo', '|', 'html'], // 设置button样式
    toolbarButtonsXS: null,
    toolbarButtonsSM: null,
    fontFamily: {
        'SimSun': '宋体',
        'Microsoft YaHei': '微软雅黑',
        'SimHei': '黑体',
        'KaiTi': '楷体',
        'Arial,Helvetica,sans-serif': 'Arial',
        'Georgia,serif': 'Georgia',
        'Impact,Charcoal,sans-serif': 'Impact',
        'Tahoma,Geneva,sans-serif': 'Tahoma',
        "'Times New Roman',Times,serif'": 'Times New Roman',
        'Verdana,Geneva,sans-serif': 'Verdana'
    }, // 字体样式
    fontSize: ['12', '14', '16', '18', '20', '24', '30', '36', '48', '60', '72'], // 字号大小
    fontSizeDefaultSelection: '14', // 默认字体大小
    imageUploadURL: '/pc/api/upload/uploadImage.do', // 图片上传路径
    imageDefaultAlign: 'left',
    imageInsertButtons: ['imageBack', '|', 'imageUpload'],
    imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif'],
    imageEditButtons:['imageAlign', 'imageRemove', 'imageDisplay', 'imageSize'],
    videoUploadURL: '/pc/api/scripts/ueditor/controller.do',
    videoMaxSize: 1024 * 1024 * 100,
    imageMaxSize: 1024 * 1024 * 100,
    videoInsertButtons: ['videoBack', '|', 'videoUpload'],
    videoAllowedTypes: ['mp4'],
    videoEditButtons: ['videoRemove', 'videoDisplay', 'videoAlign', 'videoSize'],
    linkEditButtons: ['linkOpen', 'linkEdit', 'linkRemove'],
    linkInsertButtons: ['linkBack'],
    tableEditButtons: ['tableHeader', 'tableRemove', '|', 'tableRows', 'tableColumns', '-', 'tableCells', 'tableCellBackground', 'tableCellVerticalAlign', 'tableCellHorizontalAlign']
})