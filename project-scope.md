# GDPR Datamap system

## Problem

Your challenge is to write a small frontend browser-based application that visualizes an interactive data map given a static list of system definitions.

## Features and requirements

The requirements for this app are below, and you should try to accomplish as many of them as possible without compromising on (reasonable) quality for a prototype that we're expecting to incrementally improve over time. Therefore, we don't expect this to be production-grade, but it means that code style, comments, and general code hygiene matter! With that in mind please tackle these requirements incrementally.

Create a basic app using (React + vite + tailwind + shadcn)
Convert the sample data (sample_data.json) as needed into whatever format you will use for rendering.

Render a visual data map that displays all the systems in a grid, categorized by system type. Your layout algorithm shouldn’t be static here, you should expect to be able to add/remove systems and relayout the map accordingly. Use your own judgment to decide what data should be shown, but at a minimum we’d want to see something like the mockup below, which includes:

System Name

Data Categories (excluding duplicate categories across multiple uses)

Systems arranged into groups by System Type

Improve the legibility of data categories by only rendering the most nested subcategory, e.g. location instead of user.derived.identifiable.location; for more information on data categories see https://ethyca.github.io/fideslang/#1-data-categories)

Add some interactive button elements to filter our map! Using your best judgment, add some controls on the page to:

Filter systems based on a “data use”

Filter systems based on a selection of “data categories”

Relayout the systems based on either “system type” or “data use”

Render arrows between systems to show the “system dependencies”

Add animations for when filters are changed
