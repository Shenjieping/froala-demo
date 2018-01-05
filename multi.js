/* eslint-disable */
export const FILE = {
    fileInput: null,                //html file控件
    url: "",                        //ajax地址
    fileFilter: [],
    uploadedImage: [],
    strresult:"",   
    fileFilterAdd:[],               //过滤后的文件数组
    filter: function(files) {       //选择文件组的过滤方法
        return files;   
    },
    onSelect: function() {},        //文件选择后
    onProgress: function() {},      //文件上传进度
    onSuccess: function() {},       //文件上传成功时
    onFailure: function() {},       //文件上传失败时,
    onComplete: function() {},      //文件全部上传完毕时
    
    //获取选择文件
    funGetFiles: function(e) {
        // 获取文件列表对象
        var files = e.target.files || e.dataTransfer.files;
        //继续添加文件
        this.fileFilterAdd = this.filter(files);
        //文件总数
        this.fileFilter = this.fileFilter.concat(this.fileFilterAdd);
        this.funDealFiles();
        return this;
    },  
    //选中文件的处理与回调
    funDealFiles: function() {
        this.onSelect(this.fileFilterAdd);
        return this;
    },  
    //删除对应的文件
    funDeleteFile: function(index) {
        this.uploadedImage.splice(index, 1);
        this.init();
    },
    uploadImage: function(file, index, cb) {
        var data = new FormData();
        data.append('file', file)
        $.ajax({
            url: this.url,
            type: 'POST',
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            xhr: function(){
                var xhr = $.ajaxSettings.xhr();
                if(xhr.upload) {
                    xhr.upload.onprogress = function(e) {
                        $($('progress')[index]).attr({value : e.loaded, max : e.total});
                    };
                }
                return xhr;
            },
            success: function(result) {
                cb(null, result);
            } 
        })
    },
    
    //文件上传
    funUploadFile: function() {
        var self = this;
        var files = self.fileFilter;
        if (files.length) {
            var currentFile = files.shift();        
            if (currentFile) {
                this.uploadImage(currentFile, self.uploadedImage.length, function(err, res) {
                    let obj = eval('(' + res + ')');
                    self.uploadedImage.push(obj.data.fileUrl);
                    var index = self.uploadedImage.length - 1;
                    $($('progress')[index]).hide();
                    $('.upload_append_list').eq(index).addClass("state-complete");
                    $('.upload_delete').eq(index).show();
                    self.funUploadFile();
                })
            }else {
                self.funUploadFile();
            }
        }
    },
    insertFile: function() {
        var self = this;
        if(self.uploadedImage.length) {
            var insFile = self.uploadedImage.shift();
            if(insFile){
               $($("#insertInf")).append('<p><img src="' + insFile + '" /></p>'); 
               self.insertFile(); 
            }
        }   
    },
    init: function() {
        var self = this;
        if(this.uploadedImage.length==0){
            $(".insertButton").addClass("hide");
            $(".upload_add").hide();
            $("#uploadInf").html('');
            $("#OK-1").hide();
            $(".upload_choose").removeClass("second"); 
            self.uploadedImage = [];
            self.fileFilter = [];
              if (self.fileInput) {
                $(self.fileInput).off();
                self.fileInput.value = '';
                $("#preview").html('<div id="addPic" class="upload_append_list" style="display: none;"><label for="fileImage" class="upload_add"></label>'+
                                        '<input id="fileImage" type="file" size="30" name="fileselect[]" multiple /> </div>');
                $('#insertInf').html('');
                $(self.fileInput).on("change", function(e) { self.funGetFiles(e); });
                $(self.fileInput).on("change", function(e) { self.funUploadFile(e); }); 
               }
        }
    }
};
