(function() {
    var oFileIn;
    oFileIn = document.getElementById('my_file_input');
    if(oFileIn.addEventListener) {
        oFileIn.addEventListener('change', filePicked, false);
    }

    function filePicked(oEvent) {
        // Get The File From The Input
        var oFile = oEvent.target.files[0];
        var sFilename = oFile.name;
        // Create A File Reader HTML5
        var reader = new FileReader();
        
        // Ready The Event For When A File Gets Selected
        reader.onload = function(e) {
            var data = e.target.result;
            var cfb = XLSX.read(data, {type: 'binary'});
            cfb.SheetNames.forEach(function(sheetName) {
                console.log(sheetName)
                // Obtain The Current Row As CSV
                var sCSV = XLS.utils.make_csv(cfb.Sheets[sheetName]);
                var oJS = XLS.utils.sheet_to_json(cfb.Sheets[sheetName]);

                console.log(oJS);
            });
        };

        // Tell JS To Start Reading The File
        reader.readAsBinaryString(oFile);
    }
})();