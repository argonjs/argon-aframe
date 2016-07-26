    /// How many image targets to detect and track at the same time:
    ///     MaxSimultaneousImageTargets

    /**
     *  This hint tells the tracker how many image shall be processed
     *  at most at the same time. E.g. if an app will never require
     *  tracking more than two targets, this value should be set to 2.
     *  Default is: 1.
     */
    
    /// How many object targets to detect and track at the same time
    ///     MaxSimultaneousObjectTargets
    /**
     *  This hint tells the tracker how many 3D objects shall be processed
     *  at most at the same time. E.g. if an app will never require
     *  tracking more than 1 target, this value should be set to 1.
     *  Default is: 1.
     */
    
    /// Force delayed loading for object target Dataset
    ///     DelayedLoadingObjectDatasets
    /**
     *  This hint tells the tracker to enable/disable delayed loading
     *  of object target datasets upon first detection.
     *  Loading time of large object dataset will be reduced
     *  but the initial detection time of targets will increase.
     *  Please note that the hint should be set before loading
     *  any object target dataset to be effective.
     *  To enable delayed loading set the hint value to 1.
     *  To disable delayed loading set the hint value to 0.
     *  Default is: 0.
     */

AFRAME.registerComponent('vuforia', {
    schema: { 
        name: { type: 'string'},
        url: {type: 'string'},
        activateDataset: {default: true},
        activateTracking: {default: true},
        activateCamera: {default: true},
        flashTorch: {default: false},
        MaxSimultaneousImageTargets: {default: 1},
        MaxSimultaneousObjectTargets: {default: 1},
        DelayedLoadingObjectDatasets: {default: false}
    },

    /**
     * Nothing to do
     */
    init: function () {
        
    }
});
