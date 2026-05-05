# Geoscience Adaptation: Research Workflow and Todos

This document defines the domain workflow SciPaper Todo should support when adapting from life-science manuscript work to geoscience research.

Geoscience work is usually observation-led and evidence-integration heavy. A project may combine field observations, maps, remote sensing, geophysics, laboratory measurements, chronology, numerical modeling, and uncertainty analysis before it becomes a manuscript. The app should therefore treat "research progress" as more than experiments and writing.

## Typical Workflow

### 1. Problem Framing

Goal: define the Earth-system question, spatial/temporal scope, and expected contribution.

Common outputs:

- Research question and hypothesis
- Study area or target system definition
- Spatial and temporal scales
- Candidate mechanisms or controlling factors
- Target journal and audience
- Initial figure plan: location map, data overview, workflow diagram, key result maps

Typical todos:

- State the geoscience question in one sentence
- Define study area boundaries and coordinate reference system
- Identify relevant time window, stratigraphic interval, event, or process scale
- List competing hypotheses or conceptual models
- Draft expected contribution against prior work
- Sketch the minimum figure set needed for the paper

### 2. Literature and Prior Data Reconnaissance

Goal: understand what is already known and find reusable datasets.

Common outputs:

- Annotated bibliography
- Prior maps, stratigraphic columns, DEMs, imagery, borehole logs, or survey data
- Data inventory with licenses, resolution, accuracy, and access notes
- Knowledge gaps and contradictory interpretations

Typical todos:

- Search recent papers and key regional studies
- Extract prior interpretations into claims, evidence, and limitations
- Download public DEM, satellite, geologic map, climate, hydrology, seismic, or borehole data
- Record dataset source, version, resolution, projection, license, and citation
- Build a "known constraints" note for the study area
- Flag inconsistencies between prior maps, dates, or interpretations

### 3. Study Design and Planning

Goal: turn the question into a reproducible data-acquisition and analysis plan.

Common outputs:

- Sampling plan, traverse plan, or survey plan
- Remote-sensing processing plan
- Laboratory analysis plan
- Modeling or inversion plan
- QA/QC plan
- Field safety and permits checklist, where relevant

Typical todos:

- Choose sampling sites, transects, stations, or pixels
- Define sample naming and metadata conventions
- Prepare field maps, basemaps, GPS tracks, and waypoint lists
- Confirm permits, access, weather, equipment, batteries, storage, and safety contacts
- Define lab methods, standards, blanks, duplicates, calibration, and detection limits
- Define model inputs, assumptions, boundary conditions, and validation targets
- Create a reproducible folder structure for raw, processed, analysis, figures, and manuscript files

### 4. Data Acquisition

Goal: collect observations and measurements with enough metadata for reuse and publication.

Common outputs:

- Field notes, station logs, photos, sketches, drone/satellite imagery, samples, sensor data
- Chain-of-custody and sample metadata
- Raw instrument files and calibration records
- Initial quality notes

Typical todos:

- Log station/sample ID, coordinates, elevation, date/time, operator, weather, and method
- Capture photos with scale, orientation, and station/sample linkage
- Record lithology, structure, geomorphology, water/sediment/soil properties, or hazard observations
- Back up raw files each day
- Note instrument settings, calibration files, failed measurements, and anomalies
- Update sample inventory and shipping/lab submission status

### 5. Data Processing and QA/QC

Goal: convert raw observations into analysis-ready datasets without losing provenance.

Common outputs:

- Cleaned tables
- Processed rasters, vectors, time series, point clouds, spectra, or geochemical datasets
- QA/QC report
- Processing scripts or notebooks
- Metadata and data dictionary

Typical todos:

- Normalize units, names, coordinate systems, timestamps, and null values
- Reproject spatial layers to the project CRS
- Georeference maps or imagery
- Run DEM, imagery, point cloud, seismic, or geochemical preprocessing
- Check duplicates, blanks, standards, outliers, uncertainty, and detection limits
- Preserve raw data and write processing provenance
- Export analysis-ready datasets with versioned filenames

### 6. Analysis, Interpretation, and Modeling

Goal: produce defensible results and connect them to process explanations.

Common outputs:

- Maps, cross sections, profiles, regressions, classifications, inversions, simulations, age models, or budgets
- Sensitivity tests and uncertainty estimates
- Interpretation memo connecting evidence to hypotheses
- Result-level findings ready for the Results section

Typical todos:

- Compute core metrics, indices, rates, volumes, ages, fluxes, slopes, or displacements
- Build maps, sections, profiles, or time-series plots
- Run classification, interpolation, inversion, chronology, or numerical model workflows
- Compare outputs against independent observations or prior studies
- Run uncertainty propagation, sensitivity tests, and alternative parameter sets
- Create one "finding" per result figure or result claim
- Write interpretation notes that separate observation, calculation, and inference

### 7. Figure, Map, and Table Production

Goal: make publication-ready visual evidence.

Common outputs:

- Location map
- Data and methods workflow figure
- Main result maps/plots
- Cross sections, stratigraphic columns, model output panels, or uncertainty plots
- Supplementary figures and tables

Typical todos:

- Confirm map CRS, scale bar, north arrow, legend, units, and readable labels
- Add data-source credits and basemap attribution
- Ensure color ramps match data type and are accessible
- Export vector figures where possible and high-resolution rasters where needed
- Check panel labels, caption references, and figure numbering
- Write captions that state what the reader should learn, not only what is shown

### 8. Manuscript Writing

Goal: convert the evidence chain into an IMRaD-style paper with geoscience-specific rigor.

Common outputs:

- Title and abstract
- Introduction with regional/process context and gap
- Study area or geologic setting subsection
- Data and methods
- Results organized by figures/findings
- Discussion organized by mechanism, uncertainty, comparison, and implications
- Data/code availability statement

Typical todos:

- Draft Introduction around process, place, and gap
- Write Study Area/Geologic Setting before detailed methods if the journal expects it
- Separate Data, Methods, Results, and Interpretation where the journal style requires it
- Link each result paragraph to one figure/table and one finding
- Write uncertainty and limitation paragraphs explicitly
- Add data/code availability, software versions, and repository links
- Check references for datasets, software, maps, imagery, and prior regional work

### 9. Reproducibility, Submission, and Revision

Goal: package manuscript, data, code, figures, and responses so the work can be reviewed and reused.

Common outputs:

- Clean repository or archive
- Data and code availability package
- Supplementary methods and tables
- Response to reviewers
- Revised manuscript and tracked changes

Typical todos:

- Freeze analysis version used for submission
- Verify all figures can be regenerated or traced to source files
- Deposit data/code where required and record DOI or accession
- Check journal map/data policy, figure resolution, and supplementary limits
- Prepare reviewer response with claim, action, and line references
- Track which reviewer comment changed which figure, result, or paragraph

## Todo Taxonomy for the App

The current app has progress kinds: `read`, `experiment`, `writing`, `idea`, `cite`, `analysis`, `focus`, and `mood`. For geoscience, the domain vocabulary should be expanded or remapped as follows.

Recommended geoscience todo kinds:

- `read`: literature, maps, reports, datasets, software docs
- `data`: dataset discovery, download, metadata capture, licensing
- `fieldwork`: field notes, mapping, sampling, survey, drone, instrument deployment
- `sample`: sample prep, lab submission, lab measurement, chain-of-custody
- `processing`: cleaning, reprojection, georeferencing, QA/QC, preprocessing
- `analysis`: statistics, GIS analysis, remote sensing, geophysics, geochemistry, chronology
- `modeling`: numerical models, inversions, sensitivity tests, uncertainty runs
- `figure`: maps, plots, cross sections, captions, tables
- `interpretation`: conceptual model, mechanism, comparison, uncertainty, implications
- `writing`: manuscript text, response letter, data availability, cover letter
- `cite`: references, dataset citations, software citations
- `admin`: permits, access, logistics, journal formatting, repository upload
- `focus`: timed work session
- `mood`: optional personal log

If the app keeps the current enum for now, use this temporary mapping:

- `experiment` means fieldwork, sampling, lab measurement, or survey work
- `analysis` means processing, GIS, remote sensing, modeling, QA/QC, and uncertainty
- `idea` means interpretation, hypothesis, conceptual model, or discussion insight
- `cite` includes dataset, map, software, and repository citations

## Project-Level Checklist

Every geoscience article should have these project-level todos available near the research context.

- Define study area and CRS
- Define spatial/temporal scale
- List primary datasets and source citations
- List sample IDs or station IDs, if applicable
- Record field/lab/model methods and software versions
- Create reproducible folder structure
- Build figure plan
- Track result findings by figure/table
- Track uncertainty and limitations
- Prepare data/code availability package

## Daily Todo Template

The daily log should encourage practical progress entries, not only writing output.

Morning plan:

- Pick one article or project
- Pick one work mode: read, data, fieldwork, sample, processing, analysis, modeling, figure, interpretation, writing, cite, admin
- State the concrete artifact to produce today
- State the blocker or decision to resolve

Useful daily todos:

- Read one paper and extract one usable constraint
- Add one dataset to the inventory with citation and license
- Clean or reproject one data layer
- Process one sample batch or station log
- Run one analysis/model variant and record parameters
- Produce or improve one figure panel
- Write one result finding tied to a figure
- Write one uncertainty or limitation note
- Add missing dataset/software citations
- Back up raw data and update provenance notes

End-of-day summary:

- What artifact changed
- Which dataset, sample, station, figure, or finding it affects
- What is now more certain
- What remains uncertain
- Next action

## Manuscript Section Todos

Title and Abstract:

- Include process, place, method, and contribution where possible
- Keep the abstract quantitative and avoid vague regional claims

Introduction:

- Establish process or hazard significance
- Establish regional or dataset context
- Identify knowledge gap or unresolved interpretation
- End with objective, hypothesis, and approach

Study Area or Geologic Setting:

- Describe location, tectonic/geomorphic/climatic/stratigraphic context
- Include prior constraints needed to understand results
- Keep interpretation-heavy claims for Discussion

Data and Methods:

- Separate source data from processing methods when useful
- Record software, versions, parameters, CRS, resolution, and uncertainty treatment
- Explain QA/QC and reproducibility

Results:

- One paragraph per figure, map, table, model output, or finding
- Report values, units, spatial pattern, temporal trend, and uncertainty
- Avoid deep process interpretation until Discussion

Discussion:

- Explain mechanisms and competing interpretations
- Compare to prior studies and independent constraints
- Discuss sensitivity, uncertainty, limitations, and transferability
- State implications for Earth-system process, resources, hazards, or method development

References and Data Availability:

- Cite papers, datasets, maps, imagery, software, and repositories
- Include DOI/accession/URL, version, access date when needed

## App Implications

Minimum adaptation:

- Add geoscience wording to research-context prompts.
- Add geoscience writing scenarios for Study Area/Geologic Setting, Data/Methods, Results from maps/figures, Uncertainty/Limitations, and Data Availability.
- Teach the daily log that geoscience progress includes data, field, sample, processing, modeling, figure, and interpretation work.

Better adaptation:

- Extend `ProgressEntryKind` beyond `experiment` and `analysis`.
- Allow a project to define study area, CRS, temporal scale, datasets, samples/stations, software, and repositories.
- Add finding types for observation, map pattern, chronology, model result, uncertainty, and interpretation.
- Add artifact links from todos to datasets, samples, figures, maps, scripts, and manuscript sections.

