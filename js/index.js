function renderIndex(history) {
    Handlebars.registerHelper('prettyJson', function(context) {
        return syntaxHighlight(JSON.stringify(context, null, 2));
    });

    renderHistory(history);
    renderCurrent(history);
    history.log();

    $('#wipe').bind('click', function(){
        if(confirm('Are you sure you want to remove all cookie history?')){
            history.wipe();
            renderHistory(history);
        }
    });
}

function renderHistory(history){
    var list = history.list();
    var $history = $('#history');

    if(list.length === 0 && $history.find('.entry').length === 0){
        return;
    }

    $history.html('');

    var entrySource = $('#entry-template').html();
    var entryTemplate = Handlebars.compile(entrySource);

    var repeatSource = $('#repeat-template').html();
    var repeatTemplate = Handlebars.compile(repeatSource);

    var lastChecksum = null;
    $.each(list, function(){
        var entry = this;

        if(lastChecksum === entry.checksum){
            var html = repeatTemplate(entry);
            var $el = $(html);

            var $entry = $history.find('.entry').last();
            $entry.find('.repeats').show()
                .find('.repeats-list').append(html);
        }else {
            var html = entryTemplate(entry);
            var $el = $(html);
            $el.find('.repeats').hide();

            $history.append($el);
        }

        lastChecksum = entry.checksum;
    });
}

function renderCurrent(history){
    var $current = $('#current');
    $current.html('');

    var entry = history.current();
    var list = history.list();

    var currentSource = $('#current-template').html();
    var currentTemplate = Handlebars.compile(currentSource);

    var html = currentTemplate(entry);
    var $el = $(html);

    $current.append($el);


    var comparison = 'n/a';
    var comparisonClass = '';
    if(list.length === 0){
        comparison = 'First time visting the page';
        comparisonClass = 'warning--text';
    }else if(entry.checksum === list[0].checksum){
        comparison = 'Data has not changed since you last visited';
        comparisonClass = 'success--text';
    }else{
        comparison = 'Data has changed since you last visited';
        comparisonClass = 'error--text';
    }

    $('#comparison').html(comparison)
        .removeClass('warning--text success--text error-text')
        .addClass(comparisonClass);
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}