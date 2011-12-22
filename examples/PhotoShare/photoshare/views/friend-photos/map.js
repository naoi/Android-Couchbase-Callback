function(doc) {
    if ( doc.access == "private" && doc.type == "photo" && doc.author &&
        doc._attachments && doc._attachments['original.jpg']) {
        emit([doc.author, doc._local_seq], doc.author)
    }
};