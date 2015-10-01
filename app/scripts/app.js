(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="gene-app"]');

  // Only runs once Agave is ready
  window.addEventListener('Agave::ready', function() {
    console.log('agave is ready');
    var Agave = window.Agave;
    console.log('window.agave');

    // Will be used to store initialized DataTables
    var chromosomeTable;
    var goTable;

    console.log('line');

    // Once the search button is clicked, retrieve the data
    $('#geneSearch').submit(function(event) {
      event.preventDefault();

      console.log('search button pressed');
      // Reset UI
      $('#error', appContext).empty();

      // Inserts loading text, will be replaced by table
      console.log('loading');
      $('#progress_region', appContext).removeClass('hidden');
      $('#gene_chromosome', appContext).html('<h2>Loading Chromosome Information...</h2>');
      $('#gene_go', appContext).html('<h2>Loading GO Information...</h2>');

      // Saves user input as a dict parameter
      var params = {
        'Identifier': $('input[name=identifierInput]').val(),
        'Output': 'all'
      };

      console.log('api adama');
      // Calls API to retrieve chromosome data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'araport', service: 'gene_by_geneid_v1.1',
        queryParams: params},
        showChromosomeData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Calls API to retrieve go data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'araport', service: 'go_by_geneid_v1.1',
        queryParams: params},
        showgoData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

    });

    $('#clearButton', appContext).on('click', function () {
      // clear the gene field
      $('input[name=identifierInput]', appContext).val('');

      // clear the error section
      $('#error', appContext).empty();

      // clear the number of result rows from the tabs
      $('#go_num_rows', appContext).empty();

      // clear the tables
      $('#gene_chromosome', appContext).html('<h2>Please search for a geneID.</h2>');
      $('#gene_go', appContext).html('<h2>Please search for a geneID.</h2>');

      // select the about tab
      $('a[href="#about"]', appContext).tab('show');
    });

    console.log('end function');

    var errorMessage = function errorMessage(message) {
        return '<div class="alert alert-danger fade in" role="alert">' +
               '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
               '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> ' +
               message + '</div>';
    };

    // Creates a table to display chromosome data
    var showChromosomeData = function showChromosomeData(response) {
        $('#progress_region', appContext).addClass('hidden');
        if (!(response && response.obj) || response.obj.status !== 'success') {
            $('#error', appContext).html(errorMessage('Invalid response from the server. Please try again later.'));
            return;
        }

        console.log('showChromosomeData');
        $('a[href="#gene_chromosome"]', appContext).tab('show');

        // Stores API response
        var data = response.obj || response;
        data = data.result; // data.result contains an array of objects

        // Creates a base table that the data will be stored in
        console.log('Chromosome data: ' + JSON.stringify(data));
        $('#gene_chromosome', appContext).html(
        '<table width="100%" cellspacing="0" id="gene_chromosome-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><th>Field</th><th>Result</th></thead>' +
        '<tbody id="gene_chromosome-data"></tbody></table>');

        // Add data to table
        if (data.length > 0) {
            var field = '<td>' + 'locus_id' + '</td>';
            var result = '<td>' + data[0].locus_id + '</td>';
            $('#gene_chromosome-data', appContext).append('<tr>' + field +
            result + '</tr>');

            field = '<td>' + 'chromosomeLocation.end' + '</td>';
            result = '<td>' + data[0]['chromosomeLocation.end'] + '</td>';
            $('#gene_chromosome-data', appContext).append('<tr>' + field +
            result + '</tr>');

            field = '<td>' + 'chromosomeLocation.start' + '</td>';
            result = '<td>' + data[0]['chromosomeLocation.start'] + '</td>';
            $('#gene_chromosome-data', appContext).append('<tr>' + field +
            result + '</tr>');
        }

        // Converts normal table to DataTable
        chromosomeTable = $('#gene_chromosome-table', appContext).DataTable({
          oLanguage: { // Overrides default text to make it more specific to this app
            sSearch: 'Narrow results:',
            sEmptyTable: 'No chromosome information available for this locus id.'
          },
          dom: 'Rlfrtip', // Allows for user to reorder columns
          stateSave: true // Saves the state of the table between loads
        });
      };

      // Creates a table to display go data
    var showgoData = function showgoData(response) {
        if (!(response && response.obj) || response.obj.status !== 'success') {
            $('#error', appContext).html(errorMessage('Invalid response from the server. Please try again later.'));
            return;
        }

        console.log('showgoData');
        // Stores API response
        var data = response.obj || response;
        data = data.result; // data.result contains an array of objects
        console.log('GO data: ' + JSON.stringify(data));

        // Creates a base table that the data will be stored in
        $('#gene_go', appContext).html(
          '<table id="gene_go-table" width="100%" cellspacing="0"' +
          'class="table table-striped table-bordered table-hover">' +
          '<thead><tr><th>Locus ID</th><th>Name</th>' +
          '<th>Def</th><th>Namespace</th><th>Evidence Code</th></tr></thead>' +
          '<tbody id="gene_go-data"></tbody></table>');

          // Loops through each JSON object in the data
          for (var i = 0; i < data.length; i++) {
            // Saves data in strings to later be added to table
            var locusID = '<td>' + data[i].locus_id + '</td>';
            var name = '<td>' + data[i].name + '</td>';
            var def = '<td>' + data[i].def + '</td>';
            var namespace = '<td>' + data[i].namespace + '</td>';
            var evidenceCode = '<td>' + data[i].evidence_code + '</td>';

            // Dynamically adds saved data to the table
            $('#gene_go-data', appContext).append('<tr>' + locusID +
            name + def + namespace + evidenceCode + '</tr>');
          }

          // Converts normal table to DataTable
          goTable = $('#gene_go-table', appContext).DataTable({
            oLanguage: { // Overrides default text to make it more specific to this app
              sSearch: 'Narrow results:',
              sEmptyTable: 'No GO data available for this locus id.'
            },
            dom: 'Rlfrtip', // Allows for user to reorder columns
            stateSave: true // Saves the state of the table between loads
          });

          $('#go_num_rows', appContext).html(' (' + goTable.data().length + ')');
        };

        // Displays an error message if the API returns an error
        var showErrorMessage = function showErrorMessage(response) {
            $('#progress_region', appContext).addClass('hidden');
            console.log('error:');
            console.log(response.obj.message);
            $('#error', appContext).html(errorMessage('API Error: ' + response.obj.message));
        };
    });
})(window, jQuery);
