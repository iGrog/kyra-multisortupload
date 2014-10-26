<?php

    namespace kyra\multisortupload;

    use yii\web\AssetBundle;

    class MultisortUploadAsset extends AssetBundle
    {
        public $sourcePath = '@vendor/kyra/common/assets';
        public $js = [
            'jquery.sortable.js',
            'multisortupload.js',
        ];
        public $css = [
            'multisortupload.css',
        ];
        public $depends = [
            'yii\web\JqueryAsset',
        ];
    }