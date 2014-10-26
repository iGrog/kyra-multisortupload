(function ($)
{
    $.fn.multiSortUpload = function (options)
    {
        options = $.extend({}, $.fn.multiSortUpload.config, options);

        function appendData(fd, ar, key)
        {
            $.each(ar, function (i, value)
            {
                if(value === Object(value))
                {
                    appendData(fd, value, i);
                    return;
                }

                var fdKey = key ? key + '[' + i + ']' : i ;
                fd.append(fdKey, value);
            });
        }

        return this.each(function ()
        {
            var $el = $(this);
            var $list = $(options.list);
            if(!$list.hasClass('msupload')) $list.addClass('msupload');

            var id = 'img_id_' + (new Date()).getTime();
            $('<input id="' + id + '" type="file" name="' + options.fieldName + '" multiple style="display: none" accept="image/*" />').insertAfter($el);
            var $file = $('#' + id);

            $el.on('click', function ()
            {
                $file.click();
                return false;
            });

            var doSetMain = function()
            {
                if (!confirm(options.setMainMessage)) return false;

                var $itm = $(this);
                var $cli = $itm.closest('li');
                var iid = $cli.attr('data-imageid');

                var fd = new FormData();
                fd.append(options.csrfParam, options.csrfValue);
                fd.append('ObjectID', options.objectID);
                fd.append('IID', iid);
                var addFields = options.addFields || {};
                appendData(fd, addFields);

                $.when(
                        $.ajax({
                            type: 'POST',
                            url: options.setMainUrl,
                            data: fd,
                            contentType: false,
                            processData: false,
                            dataType: 'json'
                        })).then(
                    function (json)
                    {
                    }).fail(onError);
            };

            var doRemoveClick = function ()
            {
                if (!confirm(options.removeMessage)) return false;

                var $itm = $(this);
                var $cli = $itm.closest('li');
                var iid = $cli.attr('data-imageid');

                var fd = new FormData();
                fd.append(options.csrfParam, options.csrfValue);
                fd.append('ObjectID', options.objectID);
                fd.append('IID', iid);
                var addFields = options.addFields || {};
                appendData(fd, addFields);

                $.when(
                        $.ajax({
                            type: 'POST',
                            url: options.removeUrl,
                            data: fd,
                            contentType: false,
                            processData: false,
                            dataType: 'json'
                        })).then(
                    function (json)
                    {
                        if (json.hasError)
                        {
                            console.log(json);
                            return;
                        }

                        $cli.fadeOut(1000, function()
                        {
                            $cli.remove();
                        });
                    }).fail(onError);
            };

            $list.find('li').each(function(idx, li)
            {
                var $sLi = $(li);
                if($sLi.find('.handle').length == 0)
                    $sLi.append('<div class="handle"></div>');
                if($sLi.find('button.delete').length == 0)
                    $sLi.append('<button class="delete">x</button>');
                if($sLi.find('button.main').length == 0)
                    $sLi.append('<button class="main">*</button>');
            });

            $list.find('button.delete').click(doRemoveClick);
            $list.find('button.main').click(doSetMain);

            var onError = function (a, b, c)
            {
                console.log(a, b, c);
            };

            var doSort = function (item)
            {
                var fd = new FormData();
                var order = [];
                $list.find('li').each(function (idx, li)
                {
                    var $itm = $(li);
                    var iid = $itm.attr('data-imageid');
                    order.push(iid);
                    fd.append('Order[]', iid);
                });
                if ($.isFunction(options.afterSort)) options.afterSort(order);
                if (options.afterSortUrl == '') return;

                fd.append('ObjectID', options.objectID);
                fd.append(options.csrfParam, options.csrfValue);
                var addFields = options.addFields || {};
                appendData(fd, addFields);

                $.when(
                        $.ajax({
                            type: 'POST',
                            url: options.afterSortUrl,
                            data: fd,
                            contentType: false,
                            processData: false,
                            dataType: 'json'
                        })).then(function (json)
                    {
                        console.log(json);
                    }).fail(function(a,b,c)
                    {
                        console.log(a,b,c);
                    });

            };

            $list.unbind('sortupdate', doSort);
            $list.sortable('destroy');
            $list.sortable({handle: '.handle'}).bind('sortupdate', doSort);

            $file.on('change', function ()
            {
                var ajax = [];

                $.each($file[0].files, function (idx, file)
                {
                    if(!file.type.match('image'))
                    {
                        return;
                    }
                    var time = (new Date()).getTime();
                    var id = 'list_id_' + time;
                    var imgID = 'list_img_' + time;
                    var btnID = 'btn_del_' + time;
                    var btnIDmain = 'btn_main_' + time;

                    var item = '<li id="' + id + '" class="thumbnail">'
                        + '<div class="handle"></div>'
                        + '<img id="' + imgID + '" />'
                        + '<div class="progress"></div>'
                        + '<button id="' + btnID + '" class="delete">x</button>'
                        + '<button id="' + btnIDmain + '" class="main">*</button>'
                        + '</li>';
                    $list.append(item);
                    var $img = $('#' + imgID);
                    var $li = $('#' + id);
                    var $progress = $('#' + id).find('.progress');
                    $('#' + btnID).click(doRemoveClick);
                    $('#' + btnIDmain).click(doSetMain);

                    var fd = new FormData();
                    fd.append(options.csrfParam, options.csrfValue);
                    fd.append(options.fieldName, file);
                    var addFields = options.addFields || {};
                    appendData(fd, addFields);
                    $.when(
                            $.ajax({
                                type: 'POST',
                                data: fd,
                                url: options.url,
                                contentType: false,
                                processData: false,
                                dataType: 'json',
                                xhr: function ()
                                {
                                    var xhr = $.ajaxSettings.xhr();
                                    if (xhr.upload)
                                        xhr.upload.addEventListener('progress', function (progress)
                                        {
                                            if (progress.lengthComputable)
                                            {
                                                var percentComplete = progress.loaded / progress.total * 100;
                                                $progress.css({width: percentComplete + '%'});
                                            }
                                        }, false);

                                    xhr.upload.addEventListener('load', function (end)
                                    {
                                        $progress.css({width: '100%'}).fadeOut(1000);
                                    });
                                    return xhr;
                                }
                            })

                        ).done(function (json)
                        {
                            if (json.hasError)
                            {
                                $li.html(json.error).css({color: 'white', background: 'red'}).delay(3000).fadeOut(500, function()
                                {
                                    $li.remove();
                                });
                                return;
                            }
                            var url = json.data.Images[options.jsonField];
                            $img.attr('src', url);

                            $li.attr('data-imageid', json.data[options.imageIDField]);
                            if ($.isFunction(options.success)) options.success(json);

                            $list.unbind('sortupdate', doSort);
                            $list.sortable('destroy');
                            $list.sortable({handle: '.handle'}).bind('sortupdate', doSort);

                        }).fail(onError);
                });
            });
        });
    };

    $.fn.multiSortUpload.config =
    {
        objectID: 0,
        jsonField: '',
        fieldName: 'Image',
        imageIDField: '',
        removeMessage: 'Действительно удалить это изображение?',
        setMainMessage: 'Действительно поставить это изображение обложкой?',
        inputField: '#InputField',
        button: '#UploadButton',
        csrfParam : 'csrf_',
        csrfValue : '',
        list: '#Images',
        url: '/upload',
        afterSortUrl: '',
        removeUrl: '',
        deleteUrl: '',
        setMainUrl : '',
        success: null,
        afterSort: null,
        error: null,
        addFields: [],
        addButtons: [],
    };

}(jQuery));