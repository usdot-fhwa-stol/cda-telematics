use wfd_grafana;
-- Drop tables if already exist
drop table if exists states,
locations,
testing_types,
default_event_topics,
events,
event_units,
units;
-- Create states table
create table states (
    code char(2) not null default '',
    name varchar(128) not null default '',
    primary key (code)
);
-- Create location table
create table locations(
    id int not null auto_increment,
    facility_name varchar(255) not null default '',
    city varchar(255) not null default '',
    state_code char(2) not null default '',
    zip_code varchar(10) not null default '',
    created_at timestamp default CURRENT_TIMESTAMP,
    created_by int not null default 0,
    primary key(id),
    foreign key (state_code) references states(code) on update cascade on delete cascade
);
-- Create testing_type table
create table testing_types(
    id int not null auto_increment,
    name varchar(255) not null default '',
    created_at timestamp default CURRENT_TIMESTAMP,
    created_by int not null default 0,
    primary key(id)
);
-- Create event table
create table events(
    id int not null auto_increment,
    name varchar(255) not null default '',
    description varchar(500) not null default '',
    location_id int not null default 0,
    testing_type_id int not null default 0,
    status varchar(50) not null default '',
    start_at timestamp default CURRENT_TIMESTAMP,
    end_at timestamp default CURRENT_TIMESTAMP,
    created_at timestamp default CURRENT_TIMESTAMP,
    created_by int not null default 0,
    updated_at timestamp default CURRENT_TIMESTAMP,
    updated_by int not null default 0,
    primary key(id),
    foreign key (location_id) references locations(id) on update cascade on delete cascade,
    foreign key (testing_type_id) references testing_types(id) on update cascade on delete cascade
);
-- Create unit table
create table units(
    id int not null auto_increment,
    unit_name varchar(100) not null default '',
    unit_identifier varchar(100) not null default '',
    unit_type varchar(50) not null default '',
    created_at timestamp default CURRENT_TIMESTAMP,
    created_by int not null default 0,
    primary key(id),
    unique key unique_unit_identifier (unit_identifier)
);
-- Create event_units table
create table event_units(
    id int not null auto_increment,
    unit_id int not null default 0,
    event_id int not null default 0,
    start_time timestamp not null default CURRENT_TIMESTAMP,
    end_time timestamp not null default CURRENT_TIMESTAMP,
    created_at timestamp not null default CURRENT_TIMESTAMP,
    created_by int not null default 0,
    primary key(id),
    foreign key (unit_id) references units(id)  on update cascade on delete cascade,
    foreign key (event_id) references events(id)  on update cascade on delete cascade
);

-- Create default_event_topic table
create table default_event_topics(
    id int not null auto_increment,
    topic_names text not null,
    event_id int not null default 0,
    unit_identifier varchar(100) not null default '',
    created_at timestamp default CURRENT_TIMESTAMP,
    created_by int not null default 0,
    updated_at timestamp default CURRENT_TIMESTAMP,
    updated_by int not null default 0,
    primary key(id),
    foreign key (event_id) references events(id) on update cascade on delete cascade
);