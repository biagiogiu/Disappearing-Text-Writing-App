let fadeTimeouts = [];
let fadeStartTimeout;
let typingTimeout;
let allFaded = false;

function fadeSpans() {
    let spans = document.querySelectorAll('.box span');
    spans.forEach((span, idx) => {
        span.addEventListener('animationend', (e) => {
            e.target.classList.remove('active');
            e.target.classList.add('faded')

            // Check if all spans have faded
            if (Array.from(spans).every(s => s.classList.contains('faded'))) {
                allFaded = true;
                // Remove all spans after they have all faded
                spans.forEach(s => s.remove());
                document.querySelector('.box').textContent = '';
            }
        });

       // Initial animation
        let fadeTimeout = setTimeout(() => {
            span.classList.add('active');
        }, 30 * (idx + 1));

        // Store timeout ID
        fadeTimeouts.push(fadeTimeout);
    });
}

function stopFadeSpans() {
    // Clear all timeouts
    fadeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    fadeTimeouts = []; // Reset the array

    // Restore visibility by removing 'active' and 'faded' classes if not all faded
    if (!allFaded) {
        let spans = document.querySelectorAll('.box span');
        spans.forEach((span, idx) => {
            span.classList.remove('active');
            span.classList.remove('faded');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editableDiv = document.querySelector('.box');

    editableDiv.addEventListener('keydown', (event) => {
        // Check if the key is backspace
        if (event.key === 'Backspace') {
            if (!allFaded) {
                stopFadeSpans();
            }
            // Allow default behavior for backspace
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            const span = document.createElement('span');
            const br = document.createElement('br');
            span.appendChild(br)
            insertSpanAtCaret(span)
            if (!allFaded) {
                stopFadeSpans();
            }
            // Allow default behavior for backspace
            return;
        }
    });

    editableDiv.addEventListener('keypress', (event) => {
        event.preventDefault(); // Prevent the default behavior

        // Get the pressed key
        const char = event.key;

        // Create a new span element
        const span = document.createElement('span');
        span.textContent = char;

        if (!allFaded) {
            stopFadeSpans()
        }
        // Insert the span element at the current caret position
        insertSpanAtCaret(span);

        // Reset the typing timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        typingTimeout = setTimeout(() => {
          typingStopped();
        }, 3000);
    });

    function insertSpanAtCaret(span) {
        const sel = window.getSelection();

        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const container = range.startContainer;
          const offset = range.startOffset;

          // Check if the caret is inside a span
          if (container.nodeType === Node.TEXT_NODE && container.parentNode.tagName === 'SPAN') {
            const parentSpan = container.parentNode;
            if (offset === container.textContent.length) {
              // Caret is at the end of the span, move it after the span
              parentSpan.after(span);
            } else if (offset === 0) {
              // Caret is at the start of the span, move it before the span
              parentSpan.before(span);
            } else {
              // Caret is in the middle of the span, split the text node
              const text = container.textContent;
              const beforeText = text.slice(0, offset);
              const afterText = text.slice(offset);

              const beforeNode = document.createTextNode(beforeText);
              const afterNode = document.createTextNode(afterText);

              container.parentNode.insertBefore(beforeNode, container);
              container.parentNode.insertBefore(span, container);
              container.parentNode.insertBefore(afterNode, container);
              container.parentNode.removeChild(container);
            }
          } else {
            // Insert span at caret position
            range.deleteContents();
            range.insertNode(span);
          }

          // Move the caret after the inserted span
          range.setStartAfter(span);
          range.setEndAfter(span);
          sel.removeAllRanges();
          sel.addRange(range);
        }
    }

    function typingStopped() {
        console.log('User stopped typing for more than 3 seconds.');
        fadeSpans()
      }
});
