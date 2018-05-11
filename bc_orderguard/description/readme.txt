Order Guard Pipeline
====================

This pipeline allows regular checks of order generation on the production instance.
It searches for the most recently created orders, and will log an error or send an
electronic mail message if no order below the specified maximum age is found.

Configuration
-------------

To use it, deploy the cartridge and include it in the cartridge path of business
manager and each storefront site to be monitored. Then, create a job that calls the
OrderGuard-Run pipeline, set scope to Sites, and assign it to each storefront site
to be monitored.

Set an appropriate schedule and configure the job parameters:

* MaxAge -- maximum age, measured in minutes, before generating a notification

The actual value will depend in the _lowest_ expected frequency that orders may
be generated on the storefront. Some examples:

    12 hours: MaxAge 720
    7 days: MaxAge 10080

* NotifyTo -- e-mail address to send notifications to.

If no orders below the minimum age were found, a message like the following is sent
to the address configured:

    *Warning*
    No Orders found since 2012-10-18 17:24:46 -- check the business manager for more details.
    http://myshop.example.com/on/demandware.store/Sites-SiteGenesis-Site/default/Home-Show

If no address is configured, a message is logged to the custom error log instead.
The timestamp included is measured from the job run time, minus the maximum age.

Depending on your order generation profile, and site structure, you can configure
multiple jobs with differing order age limits or e-mail recipients.

Sample Job Schedule
-------------------

The file bc_orderguard-scheduled_job.xml contains an import file that can be used
in the business manager at "Administration / Operations - Import/Export" to create
a pre-configured job schedule as an example. Within the example configuration, no
checks are configured for the weekend, since there would be nobody on the receiving
end of the e-mail, or no orders are expected during the weekend.

To enable e-mail delivery, add a NotifyTo parameter to the configuration with the
e-mail address that should receive notifications.
