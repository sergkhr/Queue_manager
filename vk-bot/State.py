class State:
    def __init__(self, id, Queue):
        self.id = id
        self.qu = Queue
        self.have_queue = False
        self.have_name = False
        self.no_message = False
        self.waiting = False
        self.pop_wait = False
        self.buf = []
