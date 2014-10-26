<?php

    namespace kyra\multisortupload;

    use kyra\multisortupload\MultisortUploadAsset;
    use Yii;

    class MultisortUpload extends \yii\base\Widget
    {
        public $objectID = 0;
        public $uploadUrl = '';

        public $button = '';
        public $list = 'ImgList';
        public $changeOrderUrl = '';
        public $removeImageUrl = '';
        public $afterUploadUrl = '';
        public $setMainUrl = '';
        public $jsonField = '';
        public $imageIDField = 'IID';
        public $afterSuccess = null;
        public $addParams = [];
        public $addButtons = [];

        public function init()
        {
            $view = $this->getView();
            MultisortUploadAsset::register($view);
        }

        public function run()
        {
            $csrfToken = Yii::$app->request->csrfParam;
            $csrfValue = Yii::$app->request->csrfToken;
            $addParams = \yii\helpers\Json::encode($this->addParams);
            $addButtons = \yii\helpers\Json::encode($this->addButtons);
            $js = <<<JS

            $('#{$this->button}').multiSortUpload({
                                    objectID : {$this->objectID},
                                    afterSortUrl : '{$this->changeOrderUrl}',
                                    list: '#{$this->list}',
                                    url: '{$this->uploadUrl}',
                                    removeUrl : '{$this->removeImageUrl}',
                                    setMainUrl: '{$this->setMainUrl}',
                                    jsonField: '{$this->jsonField}',
                                    imageIDField: '{$this->imageIDField}',
                                    success : function(json)
                                    {
                                        $.post('{$this->afterUploadUrl}',
                                        { ObjectID: {$this->objectID},
                                          IID: json.data.{$this->imageIDField},
                                          $csrfToken : '$csrfValue'
                                         }, function(ret)
                                        {
                                        }, 'json');
                                    },
                                    csrfParam : '$csrfToken',
                                    csrfValue: '$csrfValue',
                                    addFields: $addParams
                                    });
JS;

            $this->getView()->registerJs($js);

        }

    }