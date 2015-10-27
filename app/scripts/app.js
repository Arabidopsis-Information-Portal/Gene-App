/* global _ */
/* global moment */
/* jshint camelcase: false */
(function(window, $, _, moment, undefined) {
    'use strict';
    var appContext = $('[data-app-name="gene-app"]');

    // Only runs once Agave is ready
    window.addEventListener('Agave::ready', function() {
        var Agave = window.Agave;

        var templates = {
            summaryTable: _.template('<table class="table table-bordered">' +
                                     '<thead></thead><tbody>' +
                                     '<tr><th class="row-header">Gene ID</th><td><a href="https://www.araport.org/locus/<%= locus %>" target="_blank"><%= locus %>&nbsp;<i class="fa fa-external-link"></i></a></td></tr>' +
                                     '<tr><th class="row-header">Name</th><td><%= name %></td></tr>' +
                                     '<tr><th class="row-header">Symbol</th><td><%= symbol %></td></tr>' +
                                     '<tr><th class="row-header">Brief Description</th><td><%= brief_description %></td></tr>' +
                                     '<tr><th class="row-header">Computational Description</th><td><%= computational_description %></td></tr>' +
                                     '<tr><th class="row-header">Curator Summary</th><td><%= curator_summary %></td></tr>' +
                                     '<tr><th class="row-header">Length</th><td><%= length %></td></tr>' +
                                     '<tr><th class="row-header">Location</th><td><a href="https://www.araport.org/locus/<%= locus %>/browse" target="_blank"><%= location %>:<%= chromosome_start %>..<%= chromosome_end %>&nbsp;(<%= strand %>)&nbsp;<i class="fa fa-external-link"></i></a></td></tr>' +
                                     '<tr><th class="row-header">Synonyms</th><td>' +
                                     '<%= s.join(",", synonyms) %>' +
                                     '</td></tr>' +
                                     '</tbody></table>'),
            historyTable: _.template('<table class="table table-bordered table-striped">' +
                                     '<thead><tr>' +
                                     '<th>Operation</th>' +
                                     '<th>Date</th>' +
                                     '<th>Source</th>' +
                                     '<th>Genes Involved</th>' +
                                     '</tr></thead><tbody>' +
                                     '<% _.each(result, function(r) { %>' +
                                     '<tr>' +
                                     '<td><%= r.operation %></td>' +
                                     '<td><%= r.date %></td>' +
                                     '<td><%= r.source %></td>' +
                                     '<td>' +
                                     '<%= s.join(",", r.loci_involved) %>' +
                                     '</td>' +
                                     '</tr>' +
                                     '<% }) %>' +
                                     '</tbody></table>'),
            featureTable: _.template('<table class="table table-bordered table-striped">' +
                                     '<thead><tr>' +
                                     '<th>Feature</th>' +
                                     '<th>Type</th>' +
                                     '<th>Length</th>' +
                                     '<th>Location</th>' +
                                     '<th>Chromosome Start</th>' +
                                     '<th>Chromosome End</th>' +
                                     '<th>Strand</th>' +
                                     '</tr></thead><tbody>' +
                                     '<% _.each(result, function(r) { %>' +
                                     '<tr>' +
                                     '<td><%= r.feature_id %></td>' +
                                     '<td><%= r.feature_type %></td>' +
                                     '<td><%= r.length %></td>' +
                                     '<td><%= r.location %></td>' +
                                     '<td><%= r.chromosome_start %></td>' +
                                     '<td><%= r.chromosome_end %></td>' +
                                     '<td><%= r.strand %></td>' +
                                     '</tr>' +
                                     '<% }) %>' +
                                     '</tbody></table>'),
            goTable: _.template('<table class="table table-bordered table-striped">' +
                                '<thead><tr>' +
                                '<th>Namespace</th>' +
                                '<th>Name</th>' +
                                '<th>Description</th>' +
                                '<th>Evidence Code(s) <a href="http://geneontology.org/page/guide-go-evidence-codes" target="_blank"><i class="fa fa-info-circle"></i></a></th>' +
                                '<th>Dataset</th>' +
                                '<th>Dataset Version</th>' +
                                '</tr></thead><tbody>' +
                                '<% _.each(result, function(r) { %>' +
                                '<tr>' +
                                '<td><%= r.namespace %></td>' +
                                '<td><%= r.name %></td>' +
                                '<td><%= r.description %></td>' +
                                '<td>' +
                                '<%= s.join(",", r.evidence_codes) %>' +
                                '</td>' +
                                '<td><%= r.dataset_name %></td>' +
                                '<td><%= r.dataset_version %></td>' +
                                '</tr>' +
                                '<% }) %>' +
                                '</tbody>' +
                                '</table>'),
            geneRifTable: _.template('<table class="table table-bordered table-striped">' +
                                     '<thead><tr>' +
                                     '<th>Annotation</th>' +
                                     '<th>PubMed ID</th>' +
                                     '</tr></thead><tbody>' +
                                     '<% _.each(result, function(r) { %>' +
                                     '<tr>' +
                                     '<td><%= r.annotation %></td>' +
                                     '<td><span class="cell-expand"><%= r.publication.pubmed_id %> ' +
                                     '<a role="button" data-toggle="collapse" href="#<%= r.publication.pubmed_id %>" id="b<%= r.publication.pubmed_id %>" aria-expanded="false" aria-controls="<%= r.publication.pubmed_id %>">' +
                                     '<i class="fa fa-caret-square-o-down"></i></a></span><br>' +
                                     '<div id="<%= r.publication.pubmed_id %>" class="pub-info collapse">' +
                                     '<ul class="list-unstyled">' +
                                     '<li><b>Author</b>: <%= r.publication.first_author %></li>' +
                                     '<li><b>Date</b>: <%= r.publication.year %></li>' +
                                     '<li><b>Title</b>: <%= r.publication.title %></li>' +
                                     '<li><b>Journal</b>: <%= r.publication.journal %></li>' +
                                     '<li><b>Issue</b>: <%= r.publication.issue %></li>' +
                                     '<li><b>Volume</b>: <%= r.publication.volume %></li>' +
                                     '<li><b>Pages</b>: <%= r.publication.pages %></li>' +
                                     '<li><a href="http://www.ncbi.nlm.nih.gov/pubmed/<%= r.publication.pubmed_id %>" target="_blank">PubMed <i class="fa fa-external-link"></i></a></li>' +
                                     '</ul>' +
                                     '</div>' +
                                     '</td>' +
                                     '</tr>' +
                                     '<% }) %>' +
                                     '</tbody>' +
                                     '</table>'),
            publicationTable: _.template('<table class="table table-bordered table-striped">' +
                                         '<thead><tr>' +
                                         '<th>Author</th>' +
                                         '<th>Date</th>' +
                                         '<th>Title</th>' +
                                         '<th>Journal</th>' +
                                         '<th>Issue</th>' +
                                         '<th>Volume</th>' +
                                         '<th>Pages</th>' +
                                         '<th>PubMed Id</th>' +
                                         '</tr></thead><tbody>' +
                                         '<% _.each(result, function(r) { %>' +
                                         '<tr>' +
                                         '<td><%= r.first_author %></td>' +
                                         '<td><%= r.year %></td>' +
                                         '<td><%= r.title %></td>' +
                                         '<td><%= r.journal %></td>' +
                                         '<td><%= r.issue %></td>' +
                                         '<td><%= r.volume %></td>' +
                                         '<td><%= r.pages %></td>' +
                                         '<td><a href="http://www.ncbi.nlm.nih.gov/pubmed/<%= r.pubmed_id %>" target="_blank"><span class="cell-expand"><%= r.pubmed_id %> <i class="fa fa-external-link"></i></a></td>' +
                                         '</tr>' +
                                         '<% }) %>' +
                                         '</tbody>' +
                                         '</table>')
        };

        var errorMessage = function errorMessage(message) {
            return '<div class="alert alert-danger fade in" role="alert">' +
                   '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                   '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">Error:</span> ' +
                   message + '</div>';
        };

        var warningMessage = function warningMessage(message) {
            return '<div class="alert alert-warning fade in" role="alert">' +
                   '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' +
                   '<span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span><span class="sr-only">Warning:</span> ' +
                   message + '</div>';
        };

        // Displays an error message if the API returns an error
        var showErrorMessage = function showErrorMessage(response) {
            // clear progress bar and spinners
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_locus', appContext).empty();
            $('#history_num_rows', appContext).empty();
            $('#features_num_rows', appContext).empty();
            $('#go_num_rows', appContext).empty();
            $('#generif_num_rows', appContext).empty();
            $('#pub_num_rows', appContext).empty();
            console.error('Status: ' + response.obj.status + ' Message: ' + response.obj.message);
            $('#error', appContext).html(errorMessage('API Error: ' + response.obj.message));
        };

        var showSummaryTable = function showSummaryTable(json) {
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_locus', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            $('a[href="#gene_summary"]', appContext).tab('show');

            if (json.obj.result[0]) {
                $('#gene_summary_results', appContext).html(templates.summaryTable(json.obj.result[0]));
            } else {
                $('#gene_summary_results', appContext).html('');
                var search_locus = $('#locus_id', appContext).val();
                $('#error', appContext).html(warningMessage('No results found for locus identifier \'' + search_locus + '\'. Please try again.'));
            }

            $('#summary_locus', appContext).html(' ' + json.obj.result[0].locus);
        };

        var showHistoryTable = function showHistoryTable(json) {
            $('#history_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'History_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].locus;
            } else {
                filename += $('#locus_id', appContext).val();
            }
            $('#gene_history_results', appContext).html(templates.historyTable(json.obj));
            var historyTable = $('#gene_history_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                        'language': {
                                                                                            'emptyTable': 'No history data available for this locus id.'
                                                                                        },
                                                                                        'buttons': [{'extend': 'csv', 'title': filename},
                                                                                                    {'extend': 'excel', 'title': filename},
                                                                                                    'colvis'],
                                                                                        'columnDefs': [{'render': function(data,type) {
                                                                                                         var fdate = data.slice(0,4) + '-' + data.slice(4,6) + '-' + data.slice(6);
                                                                                                         if (type === 'display' || type === 'filter') {
                                                                                                             return (moment(fdate).format('DD MMM YYYY'));
                                                                                                         }
                                                                                                         return data;
                                                                                                     }, 'targets': 1}],
                                                                                        'order' : [[ 1, 'desc' ]],
                                                                                        'colReorder': true,
                                                                                        'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                                       } );

            $('#history_num_rows', appContext).html(' ' + historyTable.data().length);
        };

        var showFeaturesTable = function showFeaturesTable(json) {
            $('#features_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'Features_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].locus;
            } else {
                filename += $('#locus_id', appContext).val();
            }
            $('#gene_features_results', appContext).html(templates.featureTable(json.obj));
            var featureTable = $('#gene_features_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                         'language': {
                                                                                             'emptyTable': 'No feature data available for this locus id.'
                                                                                         },
                                                                                         'buttons': [{'extend': 'csv', 'title': filename},
                                                                                                     {'extend': 'excel', 'title': filename},
                                                                                                     'colvis'],
                                                                                         'order' : [[ 4, 'asc' ]],
                                                                                         'colReorder': true,
                                                                                         'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                                        } );

            $('#features_num_rows', appContext).html(' ' + featureTable.data().length);
        };

        var showGOTable = function showGOTable(json) {
            $('#go_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'GO_terms_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].locus;
            } else {
                filename += $('#locus_id', appContext).val();
            }
            $('#gene_go_results', appContext).html(templates.goTable(json.obj));
            var goTable = $('#gene_go_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                              'language': {
                                                                                  'emptyTable': 'No GO data available for this locus id.'
                                                                              },
                                                                              'buttons': [{'extend': 'csv', 'title': filename},
                                                                                          {'extend': 'excel', 'title': filename},
                                                                                          'colvis'],
                                                                              'order': [[0, 'asc'],[1, 'asc']],
                                                                              'colReorder': true,
                                                                              'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                             } );

            $('#go_num_rows', appContext).html(' ' + goTable.data().length);
        };

        var showGeneRIFTable = function showGeneRIFTable(json) {
            $('#generif_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'GeneRIFs_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].locus;
            } else {
                filename += $('#locus_id', appContext).val();
            }
            $('#gene_generif_results', appContext).html(templates.geneRifTable(json.obj));
            var geneRifTable = $('#gene_generif_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                        'language': {
                                                                                            'emptyTable': 'No GeneRIF data available for this locus id.'
                                                                                        },
                                                                                        'buttons': [{'extend': 'csv', 'title': filename},
                                                                                                    {'extend': 'excel', 'title': filename},
                                                                                                    'colvis'],
                                                                                        'order' : [[ 1, 'desc' ]],
                                                                                        'colReorder': true,
                                                                                        'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                                       } );

            $('#generif_num_rows', appContext).html(' ' + geneRifTable.data().length);

            $('#gene_generif_results table', appContext).on('shown.bs.collapse', '.pub-info', function () {
                var id = $(this).attr('id');
                $('#b'+id, appContext).html('<i class="fa fa-caret-square-o-up"></i>');
            });

            $('#gene_generif_results table', appContext).on('hidden.bs.collapse', '.pub-info', function () {
                var id = $(this).attr('id');
                $('#b'+id, appContext).html('<i class="fa fa-caret-square-o-down"></i>');
            });
        };

        var showPublicationTable = function showPublicationTable(json) {
            $('#pub_num_rows', appContext).empty();
            if ( ! (json && json.obj) || json.obj.status !== 'success') {
                $('#error', appContext).html(errorMessage('Invalid response from server!'));
                return;
            }

            var filename = 'Publications_for_';
            if (json.obj.result[0]) {
                filename += json.obj.result[0].locus;
            } else {
                filename += $('#locus_id', appContext).val();
            }
            $('#gene_pub_results', appContext).html(templates.publicationTable(json.obj));
            var pubTable = $('#gene_pub_results table', appContext).DataTable( {'lengthMenu': [10, 25, 50, 100],
                                                                                'language': {
                                                                                    'emptyTable': 'No Publication data available for this locus id.'
                                                                                },
                                                                                'buttons': [{'extend': 'csv', 'title': filename},
                                                                                            {'extend': 'excel', 'title': filename},
                                                                                            'colvis'],
                                                                                'order' : [[ 1, 'desc' ]],
                                                                                'colReorder': true,
                                                                                'dom': '<"row"<"col-sm-6"l><"col-sm-6"f<"button-row"B>>><"row"<"col-sm-12"tr>><"row"<"col-sm-5"i><"col-sm-7"p>>'
                                                                               } );

            $('#pub_num_rows', appContext).html(' ' + pubTable.data().length);
        };

        // method to parse URL encoded parameters by param name
        var getQueryParam = function( query ) {
            query = query.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
            var expr = '[\\?&]' + query + '=([^&#]*)';
            var regex = new RegExp( expr );
            var results = regex.exec( window.location.href );
            if( results !== null ) {
                return decodeURIComponent(results[1].replace(/\+/g, ' '));
            } else {
                return false;
            }
        };

        // controls the clear button
        $('#clearButton', appContext).on('click', function () {
            // clear the gene field
            $('#locus_id', appContext).val('');
            // clear the error section
            $('#error', appContext).empty();
            // clear the number of result rows from the tabs
            $('#progress_region', appContext).addClass('hidden');
            $('#summary_locus', appContext).empty();
            $('#history_num_rows', appContext).empty();
            $('#features_num_rows', appContext).empty();
            $('#go_num_rows', appContext).empty();
            $('#generif_num_rows', appContext).empty();
            $('#pub_num_rows', appContext).empty();
            // clear the tables
            $('#gene_summary_results', appContext).html('<h4>Please search for a gene.</h4>');
            $('#gene_history_results', appContext).html('<h4>Please search for a gene.</h4>');
            $('#gene_features_results', appContext).html('<h4>Please search for a gene.</h4>');
            $('#gene_go_results', appContext).html('<h4>Please search for a gene.</h4>');
            $('#gene_generif_results', appContext).html('<h4>Please search for a gene.</h4>');
            $('#gene_pub_results', appContext).html('<h4>Please search for a gene.</h4>');
            // select the about tab
            $('a[href="#about"]', appContext).tab('show');
        });


        // search form
        $('#geneSearch', appContext).submit(function(event) {
            event.preventDefault();

            // Reset error div
            $('#error', appContext).empty();

            // Inserts loading text, will be replaced by table
            $('#gene_summary_results', appContext).html('<h4>Loading summary information...</h4>');
            $('#gene_history_results', appContext).html('<h4>Loading history information...</h4>');
            $('#gene_features_results', appContext).html('<h4>Loading feature information...</h4>');
            $('#gene_go_results', appContext).html('<h4>Loading GO information...</h4>');
            $('#gene_generif_results', appContext).html('<h4>Loading GeneRIF information...</h4>');
            $('#gene_pub_results', appContext).html('<h4>Loading publication information...</h4>');

            // start progress bar and tab spinners
            $('#progress_region', appContext).removeClass('hidden');
            $('#summary_locus', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#history_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#features_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#go_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#generif_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');
            $('#pub_num_rows', appContext).html('<i class="fa fa-refresh fa-spin"></i>');

            var params = {
                locus: this.locus_id.value.toUpperCase()
            };

            // Calls ADAMA adapter to retrieve gene summary data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'gene_summary_by_locus_v0.2',
                'queryParams': params
            }, showSummaryTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve gene history data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'gene_history_by_locus_v0.1',
                'queryParams': params
            }, showHistoryTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve gene history data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'gene_features_by_locus_v0.2',
                'queryParams': params
            }, showFeaturesTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve GO data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'gene_ontology_by_locus_v0.2',
                'queryParams': params
            }, showGOTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve GeneRIF data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'generifs_by_locus_v0.1',
                'queryParams': params
            }, showGeneRIFTable, showErrorMessage);

            // Calls ADAMA adapter to retrieve publication data
            Agave.api.adama.search({
                'namespace': 'araport',
                'service': 'publications_by_locus_v0.1',
                'queryParams': params
            }, showPublicationTable, showErrorMessage);
        });

        // on load, populate the locus_id field if passed as a URL parameter
        // then, trigger the form submission
        $( document ).ready(function() {
            var app_url = $(location).attr('origin') + $(location).attr('pathname') + '?locus=AT1G65480';
            $('#app_link_text', appContext).html(app_url);
            $('#app_link', appContext).attr('href', app_url);
            var locus_id = getQueryParam('locus');
            if(typeof locus_id !== 'undefined' && locus_id !== false) {
                $('#locus_id', appContext).val(locus_id);
                $('#searchButton', appContext).trigger('click');
            }
        });
    });
})(window, jQuery, _, moment);
