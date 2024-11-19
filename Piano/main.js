let isRecording = false;
        let recordedNotes = [];
        let isGuiding = false;
        let currentGuideIndex = 0;

        document.querySelectorAll('.white-key, .black-key').forEach(key => {
            key.addEventListener('click', () => {
                const note = key.getAttribute('data-note');
                playNoteAndRecord(note);
                addActiveClass(key); // Add active class for the lime box shadow
            });
        });

        document.addEventListener('keydown', (event) => {
            const keyMap = {
                'c': 'C',
                'd': 'D',
                'e': 'E',
                'f': 'F',
                'g': 'G',
                'a': 'A',
                'b': 'B'
            };

            const shiftKeyMap = {
                'c': 'C-sharp',
                'd': 'D-sharp',
                'f': 'F-sharp',
                'g': 'G-sharp',
                'a': 'A-sharp'
            };

            const note = event.shiftKey ? shiftKeyMap[event.key.toLowerCase()] : keyMap[event.key.toLowerCase()];
            if (note) {
                const keyElement = document.querySelector(`[data-note="${note}"]`);
                if (keyElement) {
                    keyElement.click();
                    addActiveClass(keyElement); // Add active class for the lime box shadow
                }
            }
        });

        function playNoteAndRecord(note) {
            const audio = new Audio(`audio/${note}.mp3`);
            audio.play();

            if (isRecording) {
                recordedNotes.push({ note, timestamp: Date.now() });
            }
        }

        function addActiveClass(keyElement) {
            keyElement.classList.add('active');
            setTimeout(() => {
                keyElement.classList.remove('active'); // Remove the active class after a short time
            }, 200); // Remove after 200ms (you can adjust this timing)
        }

        document.getElementById('record').addEventListener('click', () => {
            isRecording = !isRecording;
            const recordButton = document.getElementById('record');
            if (isRecording) {
                recordedNotes = [];
                recordButton.textContent = 'Stop Recording';
                alert('Recording started!');
            } else {
                recordButton.textContent = 'Start Recording';
                alert('Recording stopped!');
            }
        });

        document.getElementById('play').addEventListener('click', () => {
            if (recordedNotes.length === 0) {
                alert('No notes recorded!');
                return;
            }

            let startTime = recordedNotes[0].timestamp;
            recordedNotes.forEach(({ note, timestamp }) => {
                setTimeout(() => {
                    const audio = new Audio(`audio/${note}.mp3`);
                    audio.play();
                }, timestamp - startTime);
            });
        });

        document.getElementById('download').addEventListener('click', () => {
            if (recordedNotes.length === 0) {
                alert('No notes recorded to download!');
                return;
            }

            const json = JSON.stringify(recordedNotes, null, 2);
            const blob = new Blob([json], { type: 'application /json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'recording.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('guide').addEventListener('click', () => {
            if (isGuiding) {
                alert("You are already being guided!");
                return;
            }

            if (recordedNotes.length === 0) {
                alert('No recorded notes to guide through!');
                return;
            }

            isGuiding = true;
            currentGuideIndex = 0;
            highlightNextKey();
        });

        function highlightNextKey() {
            if (currentGuideIndex >= recordedNotes.length) {
                alert("Guided tour finished!");
                isGuiding = false;
                return;
            }

            const note = recordedNotes[currentGuideIndex].note;
            const keyElement = document.querySelector(`[data-note="${note}"]`);

            // Highlight current key
            keyElement.classList.add('highlight');

            // Wait for user interaction or a timeout to highlight next key
            const handleKeyPress = (event) => {
                const pressedNote = event.target.getAttribute('data-note');
                if (pressedNote === note) {
                    keyElement.classList.remove('highlight'); // Unhighlight current key
                    currentGuideIndex++;
                    document.removeEventListener('click', handleKeyPress); // Remove the event listener
                    setTimeout(highlightNextKey, 500); // Move to the next key after a short delay
                }
            };

            document.addEventListener('click', handleKeyPress);
        }