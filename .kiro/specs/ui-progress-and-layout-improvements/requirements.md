# Requirements Document

## Introduction

This specification defines user interface improvements to the AWS re:Invent quiz application to enhance visual feedback and layout organization. The system will replace the numeric slide indicator with a visual progress bar, simplify the score display during gameplay, and reorganize the header layout to integrate audio controls more cohesively.

## Glossary

- **Quiz Application**: The AWS re:Invent quiz web application
- **Progress Bar**: A thin horizontal visual indicator showing quiz completion percentage
- **Content Slide**: A presentation slide showing announcement information
- **Quiz Slide**: An interactive slide presenting a question with multiple answer choices
- **Welcome Screen**: Initial screen shown before quiz starts
- **Summary Screen**: Final screen showing quiz results and total score
- **Score Display**: UI element showing the user's current points
- **Audio Controls**: UI element for muting/unmuting background music and sound effects
- **Header**: Top section of the application containing branding and status information
- **Current Points**: The points earned by the user so far in the current session
- **Maximum Points**: The total possible points achievable in the quiz

## Requirements

### Requirement 1

**User Story:** As a quiz taker, I want to see a visual progress bar instead of a slide counter, so that I can quickly understand how far I've progressed through the quiz.

#### Acceptance Criteria

1. WHEN a Content Slide is displayed THEN the Quiz Application SHALL render a progress bar at the very top of the screen
2. WHEN a Quiz Slide is displayed THEN the Quiz Application SHALL render a progress bar at the very top of the screen
3. WHEN the progress bar is rendered THEN the Quiz Application SHALL position it spanning the full width of the screen from left edge to right edge
4. WHEN the progress bar is rendered THEN the Quiz Application SHALL set the height to a few pixels (maximum 4 pixels)
5. WHEN the user advances through slides THEN the Quiz Application SHALL update the progress bar fill percentage to reflect current position divided by total slides

### Requirement 2

**User Story:** As a quiz taker, I want the progress bar to be visually subtle, so that it provides information without distracting from the content.

#### Acceptance Criteria

1. WHEN the progress bar is rendered THEN the Quiz Application SHALL position it at the absolute top of the viewport with zero margin
2. WHEN the progress bar is styled THEN the Quiz Application SHALL use a thin height between 2 and 4 pixels
3. WHEN the progress bar shows progress THEN the Quiz Application SHALL use a color that contrasts with the background while maintaining brand consistency
4. WHEN the progress bar updates THEN the Quiz Application SHALL animate the width change smoothly over 300 milliseconds
5. WHEN the progress bar is displayed THEN the Quiz Application SHALL ensure it does not overlap with other UI elements

### Requirement 3

**User Story:** As a quiz taker, I want the progress bar to appear only during content and quiz slides, so that the welcome and summary screens remain clean and focused.

#### Acceptance Criteria

1. WHEN the Welcome Screen is displayed THEN the Quiz Application SHALL NOT render the progress bar
2. WHEN the Summary Screen is displayed THEN the Quiz Application SHALL NOT render the progress bar
3. WHEN transitioning from Welcome Screen to the first slide THEN the Quiz Application SHALL display the progress bar
4. WHEN transitioning to the Summary Screen THEN the Quiz Application SHALL remove the progress bar
5. WHEN navigating between Content Slides and Quiz Slides THEN the Quiz Application SHALL maintain the progress bar visibility

### Requirement 4

**User Story:** As a quiz taker, I want to see only my current points during gameplay, so that I can focus on my performance without being distracted by maximum possible points.

#### Acceptance Criteria

1. WHEN a Content Slide is displayed THEN the Quiz Application SHALL show only the current points value
2. WHEN a Quiz Slide is displayed THEN the Quiz Application SHALL show only the current points value
3. WHEN the score updates THEN the Quiz Application SHALL update the displayed current points value
4. WHEN the Welcome Screen is displayed THEN the Quiz Application SHALL NOT display any score information
5. WHEN displaying current points THEN the Quiz Application SHALL use clear, readable typography

### Requirement 5

**User Story:** As a quiz taker, I want to see both my current points and maximum possible points on the summary screen, so that I can understand my final performance in context.

#### Acceptance Criteria

1. WHEN the Summary Screen is displayed THEN the Quiz Application SHALL show the current points earned
2. WHEN the Summary Screen is displayed THEN the Quiz Application SHALL show the maximum possible points
3. WHEN displaying final score THEN the Quiz Application SHALL format it as "X / Y points" or "X out of Y points"
4. WHEN the Summary Screen is displayed THEN the Quiz Application SHALL calculate and display the percentage score
5. WHEN the final score is shown THEN the Quiz Application SHALL use prominent typography to emphasize the achievement

### Requirement 6

**User Story:** As a quiz taker, I want the audio controls integrated into the header, so that I can easily access volume settings without searching for a separate control.

#### Acceptance Criteria

1. WHEN the Header is rendered THEN the Quiz Application SHALL position the audio controls to the right of the current points display
2. WHEN the audio controls are positioned THEN the Quiz Application SHALL align them horizontally with the score display
3. WHEN the audio controls are displayed THEN the Quiz Application SHALL use an icon-based button for mute/unmute functionality
4. WHEN the user clicks the audio control THEN the Quiz Application SHALL toggle between muted and unmuted states
5. WHEN the audio state changes THEN the Quiz Application SHALL update the icon to reflect the current state (muted or unmuted)

### Requirement 7

**User Story:** As a quiz taker, I want the header layout to be clean and organized, so that I can quickly scan the important information.

#### Acceptance Criteria

1. WHEN the Header is rendered THEN the Quiz Application SHALL organize elements in a single horizontal row
2. WHEN the Header contains multiple elements THEN the Quiz Application SHALL align the score display and audio controls to the right side
3. WHEN the Header is displayed THEN the Quiz Application SHALL maintain consistent spacing between elements
4. WHEN the Header is rendered on different screen sizes THEN the Quiz Application SHALL adapt the layout to maintain readability
5. WHEN the Header elements are positioned THEN the Quiz Application SHALL ensure no overlap occurs between elements

### Requirement 8

**User Story:** As a developer, I want to remove the old slide counter display, so that the codebase reflects the new progress bar approach and avoids confusion.

#### Acceptance Criteria

1. WHEN the progress bar is implemented THEN the Quiz Application SHALL remove all code related to the numeric slide counter (x/y format)
2. WHEN components are refactored THEN the Quiz Application SHALL remove any props or state related to slide counting display
3. WHEN the Header component is updated THEN the Quiz Application SHALL remove the slide counter from the component tree
4. WHEN tests are updated THEN the Quiz Application SHALL remove or update tests that verify slide counter behavior
5. WHEN the refactoring is complete THEN the Quiz Application SHALL ensure no references to the old slide counter remain in the codebase

### Requirement 9

**User Story:** As a quiz taker, I want to see a trophy icon next to my score, so that the score display feels more rewarding and visually appealing.

#### Acceptance Criteria

1. WHEN the score is displayed in the Header THEN the Quiz Application SHALL render a trophy icon to the left of the score value
2. WHEN the trophy icon and score are displayed THEN the Quiz Application SHALL wrap them together in a container with a thin rounded border
3. WHEN the border is rendered THEN the Quiz Application SHALL use a color that complements the re:Invent brand palette
4. WHEN the trophy icon is displayed THEN the Quiz Application SHALL size it appropriately to match the score text height
5. WHEN the trophy and score container is rendered THEN the Quiz Application SHALL apply padding to create visual breathing room

### Requirement 10

**User Story:** As a content creator, I want to embed video content in slides, so that I can create more engaging and dynamic presentations.

#### Acceptance Criteria

1. WHEN a video block is specified in the Data File THEN the Quiz Application SHALL render an HTML5 video player
2. WHEN the autoplay property is set to true THEN the Quiz Application SHALL automatically play the video when the slide loads
3. WHEN the loop property is set to true THEN the Quiz Application SHALL continuously loop the video playback
4. WHEN a preview image is specified THEN the Quiz Application SHALL display the preview image before video playback starts
5. WHEN the videoFile property is specified THEN the Quiz Application SHALL load the video from the public/data/video directory
6. WHEN a size property is specified THEN the Quiz Application SHALL apply the same size classes as image blocks (small, medium, large, full)
7. WHEN the video fails to load THEN the Quiz Application SHALL display the preview image as a fallback without breaking the presentation flow

### Requirement 11

**User Story:** As a content creator, I want to add clickable links in slides, so that I can direct users to external resources or documentation.

#### Acceptance Criteria

1. WHEN a link block is specified in the Data File THEN the Quiz Application SHALL render a clickable hyperlink element
2. WHEN the url property is specified THEN the Quiz Application SHALL set the href attribute to the provided URL
3. WHEN the text property is specified THEN the Quiz Application SHALL display the text as the link label
4. WHEN the newTab property is set to true THEN the Quiz Application SHALL open the link in a new browser tab with rel="noopener noreferrer" for security
5. WHEN the newTab property is set to false THEN the Quiz Application SHALL open the link in the same tab
6. WHEN the style property is set to "button" THEN the Quiz Application SHALL render the link with button styling matching the re:Invent brand
7. WHEN the style property is set to "text" THEN the Quiz Application SHALL render the link as inline text with underline on hover
