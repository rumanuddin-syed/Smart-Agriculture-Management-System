# Evidence Report

All numbers are derived from existing files. Wilson 95% confidence intervals are shown.

| Scope | Metric | Submetric | Count | N | 95% CI |
|---|---|---|---|---|---|
|Overall|Status Share|confident|5689|7276|0.7722–0.7912|
|Overall|Status Share|retake|273|7276|0.0334–0.0421|
|Overall|Status Share|uncertain|1141|7276|0.1486–0.1654|
|Overall|Status Share|rejected|173|7276|0.0205–0.0275|
|PlantSeg|Status Share|uncertain|363|1090|0.3057–0.3616|
|PlantSeg|Status Share|retake|36|1090|0.0240–0.0454|
|PlantSeg|Status Share|rejected|71|1090|0.0520–0.0814|
|PlantSeg|Status Share|confident|620|1090|0.5392–0.5979|
|PlantWild|Status Share|retake|56|1402|0.0309–0.0515|
|PlantWild|Status Share|uncertain|641|1402|0.4313–0.4834|
|PlantWild|Status Share|confident|625|1402|0.4200–0.4719|
|PlantWild|Status Share|rejected|80|1402|0.0461–0.0705|
|PlantVillage|Status Share|confident|4444|4784|0.9213–0.9359|
|PlantVillage|Status Share|retake|181|4784|0.0328–0.0436|
|PlantVillage|Status Share|uncertain|137|4784|0.0243–0.0338|
|PlantVillage|Status Share|rejected|22|4784|0.0030–0.0070|
|Real|Status Share|retake|92|2492|0.0302–0.0451|
|Real|Status Share|uncertain|1004|2492|0.3838–0.4223|
|Real|Status Share|confident|1245|2492|0.4800–0.5192|
|Real|Status Share|rejected|151|2492|0.0519–0.0707|
|Real|Coverage|confident & seen_in_train|1241|2480|0.4807–0.5201|
|Real|Selective Accuracy|confident seen correct|1108|1241|0.8744–0.9088|
|Real|End-to-End Correct|confident correct / all seen|1108|2480|0.4273–0.4664|
|Overall|Crop Accuracy|crop_pred vs true_crop|6492|6919|0.9324–0.9437|
|Real|Confident Healthy Accuracy|correct|209|230|0.8645–0.9395|
|Real|Confident Diseased Accuracy|correct|899|1015|0.8647–0.9039|
|Overall|Unseen Classes Confident Share|4|12|0.1381–0.6094|
|Overall|Unseen Classes Note|n<50||12||
|Real|Uncertain Reasons|crop_low_confidence|357|1004|0.3266–0.3857|
|Real|Uncertain Reasons|disease_low_confidence|151|1004|0.1296–0.1738|
|Real|Uncertain Reasons|models_disagree;disease_low_confidence;neighbors_disagree_crop;neighbors_disagree_label|20|1004|0.0129–0.0306|
|Real|Uncertain Reasons|neighbors_disagree_crop;neighbors_disagree_label|134|1004|0.1138–0.1559|
|Real|Uncertain Reasons|neighbors_disagree_crop|94|1004|0.0771–0.1132|
|Real|Uncertain Reasons|neighbors_disagree_label|48|1004|0.0362–0.0628|
|Real|Uncertain Reasons|models_disagree;disease_low_confidence|77|1004|0.0618–0.0948|
|Real|Uncertain Reasons|health_low_confidence|25|1004|0.0169–0.0365|
|Real|Uncertain Reasons|disease_low_confidence;neighbors_disagree_label|9|1004|0.0047–0.0169|
|Real|Uncertain Reasons|disease_low_confidence;neighbors_disagree_crop;neighbors_disagree_label|42|1004|0.0311–0.0561|
|Real|Uncertain Reasons|models_disagree;disease_low_confidence;neighbors_disagree_label|27|1004|0.0185–0.0388|
|Real|Uncertain Reasons|disease_low_confidence;neighbors_disagree_crop|3|1004|0.0010–0.0087|
|Real|Uncertain Reasons|health_low_confidence;neighbors_disagree_crop|14|1004|0.0083–0.0233|
|Real|Uncertain Reasons|models_disagree;disease_low_confidence;neighbors_disagree_crop|3|1004|0.0010–0.0087|
|Real|Non-Confident Stage|quality|92|1247|0.0605–0.0896|
|Real|Non-Confident Stage|confidence|1004|1247|0.7822–0.8262|
|Real|Non-Confident Stage|plant_detection|62|1247|0.0390–0.0632|
|Real|Non-Confident Stage|ood|89|1247|0.0584–0.0870|
|Real|Crop Worst|blueberry|n=59|coverage=0.2314–0.4663|sel_acc=0.2993–0.7007|
|Real|Crop Worst|ginger|n=44|coverage=0.1635–0.4185|sel_acc=0.2538–0.7462|
|Real|Crop Worst|bell_pepper|n=47|coverage=0.1694–0.4176|sel_acc=0.2914–0.7679|
|Real|Crop Worst|squash|n=65|coverage=0.2759–0.5062|sel_acc=0.3707–0.7333|
|Real|Crop Worst|potato|n=67|coverage=0.2672–0.4928|sel_acc=0.4452–0.7975|
|Real|Crop Worst|bean|n=81|coverage=0.2512–0.4541|sel_acc=0.5294–0.8475|
|Real|Crop Worst|broccoli|n=31|coverage=0.2373–0.5618|sel_acc=0.4677–0.9111|
|Real|Crop Worst|tobacco|n=27|coverage=0.3731–0.7241|sel_acc=0.5481–0.9295|
|Real|Crop Worst|tomato|n=246|coverage=0.2168–0.3269|sel_acc=0.6916–0.8811|
|Real|Crop Worst|garlic|n=56|coverage=0.3733–0.6267|sel_acc=0.6441–0.9212|
|Real|Crop Confusion|squash->zucchini|18|||
|Real|Crop Confusion|tomato->potato|16|||
|Real|Crop Confusion|bean->soybean|15|||
|Real|Crop Confusion|soybean->bean|12|||
|Real|Crop Confusion|wheat->rice|9|||
|Real|Crop Confusion|apple->cherry|8|||
|Real|Crop Confusion|cucumber->squash|8|||
|Real|Crop Confusion|garlic->wheat|8|||
|Real|Crop Confusion|zucchini->squash|8|||
|Real|Crop Confusion|cherry->apple|7|||
|Real|Crop Confusion|ginger->rice|7|||
|Real|Crop Confusion|plum->apple|7|||
|Real|Crop Confusion|potato->tomato|7|||
|Real|Crop Confusion|zucchini->cucumber|7|||
|Real|Crop Confusion|cucumber->zucchini|6|||
|Real|Disease Confusion|squash___powdery_mildew->zucchini___powdery_mildew|9|||
|Real|Disease Confusion|ginger___sheath_blight->rice___sheath_blight|4|||
|Real|Disease Confusion|potato___early_blight->potato___late_blight|4|||
|Real|Disease Confusion|apple___rust->apple___scab|3|||
|Real|Disease Confusion|bean___mosaic_virus->soybean___mosaic|3|||
|Real|Disease Confusion|blueberry___rust->apple___rust|3|||
|Real|Disease Confusion|tobacco___frogeye_leaf_spot->tobacco___brown_spot|3|||
|Real|Disease Confusion|apple___scab->cherry___leaf_spot|2|||
|Real|Disease Confusion|bean___halo_blight->soybean___brown_spot|2|||
|Real|Disease Confusion|blueberry___rust->bean___rust|2|||
|Real|Disease Confusion|blueberry___rust->cherry___leaf_spot|2|||
|Real|Disease Confusion|cherry___leaf_spot->soybean___frog_eye_leaf_spot|2|||
|Real|Disease Confusion|corn___gray_leaf_spot->corn___healthy|2|||
|Real|Disease Confusion|cucumber___powdery_mildew->zucchini___powdery_mildew|2|||
|Real|Disease Confusion|garlic___rust->wheat___leaf_rust|2|||
|Real|Calib Bin|Bin1|n=249|correct=204|0.7667–0.8621|
|Real|Calib Bin|Bin2|n=249|correct=225|0.8606–0.9344|
|Real|Calib Bin|Bin3|n=249|correct=236|0.9127–0.9692|
|Real|Calib Bin|Bin4|n=249|correct=222|0.8468–0.9244|
|Real|Calib Bin|Bin5|n=249|correct=221|0.8423–0.9210|
|Report|Cross-check|performed||||
