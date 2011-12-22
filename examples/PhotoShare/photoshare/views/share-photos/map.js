function(doc) {
    if ( doc.access == "public" && doc.type == "photo" &&
        doc._attachments && doc._attachments['original.jpg']) {
        emit([doc.author, doc._local_seq], doc.author)
    }
};