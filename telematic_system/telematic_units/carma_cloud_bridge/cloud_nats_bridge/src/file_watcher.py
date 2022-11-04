import os
import time
from multiprocessing import Lock
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, LoggingEventHandler


class EventHandler(FileSystemEventHandler):
    def __init__(self, filepath, filename):
        self.filepath = filepath
        self.filename = filename
        self.lock = Lock()

        #Need to get current number of lines or characters in file
        with open(f'{self.filepath}/{self.filename}', 'r', encoding="utf-8") as f:
            # self.current_lines = len(f.readlines())
            data = f.read().replace(" ","") #replace spaces with nothing, adds character for newline
            self.current_characters_count = len(data)
        f.close()

        print("Using this file: " + str(self.filepath) + "/" + str(self.filename))
        # print("Current number of lines in file: " + str(self.current_lines))
        print("Current number of characters in file: " + str(self.current_characters_count))


    def on_modified(self, event):
        #check if the modified file event is the file we are interested in
        if event.src_path == self.filepath:
            
            #print new line of data
            # with self.lock:
            #     with open(f'{event.src_path}/{self.filename}', 'r', encoding="utf-8") as f:
            #         line_count = 1
            #         for line in f:
            #             if line_count > self.current_lines:
            #                 print("New line found with data: " + str(line))
            #                 self.current_lines = line_count

            #             line_count += 1

            #print new data characters
            with self.lock:
                with open(f'{event.src_path}/{self.filename}', 'r', encoding="utf-8") as f:
                    char_count = 0

                    while True:
                        c = f.read(1)
                        #not c signifies the end of the file
                        if not c:
                            break
                        #add to a character count and print any new characters
                        else:
                            char_count += 1                          
                            if char_count > self.current_characters_count:
                                print("Found a new character: " + str(c))


if __name__ == "__main__":
    filepath = "."
    filename = "test_file.txt"
    event_handler = EventHandler(filepath, filename)
    observer = Observer()
    observer.schedule(event_handler, filepath, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()